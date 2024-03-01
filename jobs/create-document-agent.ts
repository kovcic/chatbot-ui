import { client } from "@/trigger";
import { Database } from "@/supabase/types";
import { SupabaseManagement, Supabase } from "@trigger.dev/supabase";
import { getNodes, getDocuments } from "@/lib/rag/nodes";
import { jsonToNode, Document } from "llamaindex";
import { createVectorIndex } from "@/lib/rag/vector-index";
import { createSummaryIndex } from "@/lib/rag/summary-index";
import { extractMetadata } from "@/lib/rag/metadata";
import * as llamaParse from "@/lib/rag/llama-parse";

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

client.defineJob({
  id: "create-document-agent",
  name: "Document Agent Creation",
  version: "1.1.0",
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
    console.info('Running job', ctx.job, payload);
    await io.logger.info(`File uploaded: "${payload.record.name}"`);

    const documents = await io.supabase.runTask('parse-file', async (supabase) => {
      const { data: file, error } = await supabase.storage.from("files").download(payload.record.file_path);

      if (error) {
        throw new Error(error.message);
      }

      if (!file) {
        throw new Error('File not found');
      }

      const documents = await getDocuments(file);

      return documents.map((document) => document.toJSON());
    });

    const nodes = await io.runTask('chunk-documents', async () => {
      const documentObjects = documents.map((document) => jsonToNode(document));
      const nodes = getNodes(documentObjects);

      return nodes.map((node) => node.toJSON());
    });

    await io.runTask('create-vector-index', async () => {
      const nodeObjects = nodes.map((node) => jsonToNode(node));

      await createVectorIndex(payload.record.id, nodeObjects);

      return 'Vector index created';
    });

    await io.runTask('create-summary-index', async () => {
      const documentObjects = documents.map((document) => jsonToNode(document));

      await createSummaryIndex(payload.record.id, documentObjects);

      return 'Summary index created';
    });

    const metadata = await io.runTask('extract-metadata', async () => {
      const nodeObjects = nodes.map((node) => jsonToNode(node));
      const metadata = await extractMetadata(nodeObjects);

      return metadata;
    });

    await io.supabase.runTask("update-file-metadata", async (supabase) => {
      const { data: updatedFile, error } = await supabase
        .from("files")
        .update({ metadata })
        .eq("id", payload.record.id)
        .select("*")
        .single();

      if (error) {
        throw new Error(error.message);
      }

      return updatedFile;
    });
  },
});