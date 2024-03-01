import { client } from "@/trigger";
import { Database } from "@/supabase/types";
import { SupabaseManagement, Supabase } from "@trigger.dev/supabase";
import { createVectorIndex } from "@/lib/rag/vector-index";

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
  id: "create-top-agent",
  name: "Top Agent Creation",
  version: "1.1.0",
  trigger: db.onInserted({
    schema: "public",
    table: "collections",
    filter: {
      record: {
        top_agent: [true],
      },
    },
  }),
  enabled: false, // disabled as we are creating the top agent when adding files to a collection
  integrations: {
    supabase,
  },
  run: async (payload, io, ctx) => {
    console.info('Running job', ctx.job, payload);
    await io.logger.info(`Collection created: "${payload.record.name}"`);

    await io.runTask('create-vector-index', async () => {
      await createVectorIndex(payload.record.id, []);

      return 'Vector index created';
    });
  },
});