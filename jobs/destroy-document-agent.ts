import { client } from "@/trigger";
import { Database } from "@/supabase/types";
import { SupabaseManagement } from "@trigger.dev/supabase";
import { deleteVectorIndex } from "@/lib/rag/vector-index";
import { deleteSummaryIndex } from "@/lib/rag/summary-index";

const supabaseManagement = new SupabaseManagement({
  id: "supabase-management",
});

// Use the types we generated earlier
const db = supabaseManagement.db<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!
);

client.defineJob({
  id: "destroy-document-agent",
  name: "Document Agent Destruction",
  version: "1.1.0",
  trigger: db.onDeleted({
    schema: "public",
    table: "files",
    filter: {
      old_record: {
        document_agent: [true],
      },
    },
  }),
  run: async (payload, io, ctx) => {
    console.info('Running job', ctx.job, payload);
    await io.logger.info(`File deleted: "${payload.old_record.name}"`);

    await io.runTask('delete-vector-index', async () => {
      await deleteVectorIndex(payload.old_record.id);

      return 'Vector index deleted';
    });

    await io.runTask('delete-summary-index', async () => {
      await deleteSummaryIndex(payload.old_record.id);

      return 'Summary index deleted';
    });
  },
});