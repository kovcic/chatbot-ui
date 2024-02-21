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
  version: "1.0.0",
  trigger: db.onInserted({
    schema: "public",
    table: "collections",
    filter: {
      record: {
        top_agent: [true],
      },
    },
  }),
  integrations: {
    supabase,
  },
  run: async (payload, io, ctx) => {
    await io.logger.info(`Collection created: "${payload.record.name}"`);

    await io.runTask('create-vector-index', async () => {
      await createVectorIndex(payload.record.id, []);

      return 'Vector index created';
    });


    // const nodes = await io.runTask('chunk-documents', async () => {
    //   const documentObjects = documents.map((document) => jsonToNode(document));
    //   const nodes = await getNodes(documentObjects);

    //   return nodes.map((node) => node.toJSON());
    // });

    // await io.runTask('create-vector-index', async () => {
    //   const nodeObjects = nodes.map((node) => jsonToNode(node));

    //   await createVectorIndex(payload.record.id, nodeObjects);

    //   return 'created vector index';
    // });

  },
});