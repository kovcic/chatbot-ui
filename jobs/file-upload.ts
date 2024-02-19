import { client } from "@/trigger";
import { Database } from "@/supabase/types";
import { SupabaseManagement } from "@trigger.dev/supabase";

// Use OAuth to authenticate with Supabase Management API
const supabaseManagement = new SupabaseManagement({
  id: "supabase-management",
});

// Use the types we generated earlier
const db = supabaseManagement.db<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!
);

client.defineJob({
  id: "file-upload",
  name: "Document upload",
  version: "1.0.0",
  trigger: db.onInserted({
    // Trigger this job whenever a file is inserted into the files table
    table: "files",
    // schema: "public",
  }),
  integrations: {},
  run: async (payload, io, ctx) => {
    // payload.record is typed based on the Supabase schema
    console.info("File uploaded 123", payload.record);

    await io.wait("⌛", 5); // Waits for 5 sec but you might want to wait longer

    console.info("ToDo - index the file in vector store");
  },
});