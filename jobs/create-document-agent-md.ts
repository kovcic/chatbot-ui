import { client } from "@/trigger";
import { Database } from "@/supabase/types";
import { SupabaseManagement, Supabase } from "@trigger.dev/supabase";
import { getNodes, getDocuments } from "@/lib/rag/nodes";
import { jsonToNode, Document, ServiceContext, MarkdownNodeParser } from "llamaindex";
import { createVectorIndex } from "@/lib/rag/vector-index";
import { createSummaryIndex } from "@/lib/rag/summary-index";
import { extractMetadata } from "@/lib/rag/metadata";
import * as llamaParse from "@/lib/rag/llama-parse";
import { createServiceContext } from "@/lib/rag/service-context";
import { isTriggerError } from "@trigger.dev/sdk";

const supabase = new Supabase({
  id: "supabase",
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL!,
  supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
});

// Use OAuth to authenticate with Supabase Management API
const supabaseManagement = new SupabaseManagement({
  id: "supabase-management",
});

// Use the types we generated earlier
const db = supabaseManagement.db<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!
);

const defaultTaskOptions = {
  retry: {
    limit: 5,
    factor: 2,
    minTimeoutInMs: 5000,
  },
};

client.defineJob({
  id: "create-document-agent",
  name: "Document Agent Creation",
  version: "1.0.1",
  trigger: db.onUpdated({
    schema: "public",
    table: "files",
    filter: {
      old_record: {
        document_agent: [true],
        file_path: [''],
      },
      record: {
        document_agent: [true],
        file_path: [{ $anythingBut: '' }],
      },
    },
  }),
  integrations: {
    supabase,
  },
  run: async (payload, io, ctx) => {
    await io.logger.info(`File uploaded: "${payload.record.name}"`);

    try {
      // this is on purpose ouside of the run task so it's updated every time the job runs
      await io.supabase.client
        .from("files")
        .update({ run_status: 'IN_PROGRESS' })
        .eq("id", payload.record.id);

      const result = await io.supabase.runTask('parse-file', async (supabase) => {
        const { data: file, error: downloadError } = await supabase.storage.from("files").download(payload.record.file_path);

        if (downloadError) {
          throw new Error(downloadError.message);
        }

        if (!file) {
          throw new Error('File not found');
        }

        const jobId = await io.runTask('upload-file', async () => {
          const jobId = await llamaParse.upload(file);

          return jobId;
        }, defaultTaskOptions);

        let status = '';
        let i = 0;
        while (status !== 'SUCCESS') {
          i += 1;

          await io.wait(`wait-${i}`, 1);
          status = await io.runTask(`check-job-status-${i}`, async () => {
            const status = await llamaParse.check(jobId);

            return status;
          }, defaultTaskOptions);
        }

        const result = await io.runTask('get-job-result', async () => {
          const result = await llamaParse.result(jobId);

          return result;
        }, defaultTaskOptions);

        return result;
      }, defaultTaskOptions);

      await io.supabase.runTask('write-result-to-storage', async (supabase) => {
        supabase
          .storage
          .from("files")
          .upload(`${payload.record.file_path}.md`, result, { contentType: 'text/markdown' });
      }, defaultTaskOptions);

      const documents = [new Document({ text: result })];
      const parser = MarkdownNodeParser.fromDefaults({ includeMetadata: false });
      const nodes = parser.getNodesFromDocuments(documents);

      await io.runTask('create-vector-index', async () => {
        await createVectorIndex(payload.record.id, nodes);

        return 'Vector index created';
      });

      await io.runTask('create-summary-index', async () => {
        const documents = [new Document({ text: result })];
        const serviceContext: ServiceContext = {
          ...createServiceContext(),
          nodeParser: MarkdownNodeParser.fromDefaults({ includeMetadata: false }),
        };

        await createSummaryIndex(payload.record.id, documents, { serviceContext });

        return 'Summary index created';
      });

      const metadata = await io.runTask('extract-metadata', async () => {
        const metadata = await extractMetadata(nodes);

        return metadata;
      });

      await io.supabase.runTask("update-file-metadata", async (supabase) => {
        const { data: updatedFile, error } = await supabase
          .from("files")
          .update({ metadata, run_status: 'SUCCESS' })
          .eq("id", payload.record.id)
          .select("*")
          .single();

        if (error) {
          throw new Error(error.message);
        }

        return updatedFile;
      });
    } catch (error) {
      await io.supabase.client
        .from("files")
        .update({ run_status: 'ERROR' })
        .eq("id", payload.record.id);

      if (isTriggerError(error)) {
        throw error;
      } else {
        console.error(error);
      }
    }
  },
});