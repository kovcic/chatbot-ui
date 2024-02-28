import { client } from "@/trigger";
import { Database } from "@/supabase/types";
import { SupabaseManagement, Supabase } from "@trigger.dev/supabase";
import { addDocumentToTopAgent, removeDocumentFromTopAgent } from "@/lib/rag/agents";

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
  id: "add-document-to-top-agent",
  name: "Top Agent Document Addition",
  version: "1.0.0",
  trigger: db.onInserted({
    schema: "public",
    table: "collection_files",
  }),
  integrations: {
    supabase,
  },
  run: async (payload, io, ctx) => {
    const { data: collection, error } = await io.supabase
      .client
      .from('collections')
      .select('*')
      .eq('id', payload.record.collection_id)
      .single();

    if (error) {
      throw new Error(error.message);
    }

    if (collection.top_agent) {
      const { data: file, error } = await io.supabase
        .client
        .from('files')
        .select('*')
        .eq('id', payload.record.file_id)
        .single();

      if (error) {
        throw new Error(error.message);
      }

      if (file.document_agent) {
        await io.logger.info(`Adding file: "${file.name}" to top agent: "${collection.name}"`);

        // count is used to determine if to create the vector index or not
        const { count } = await io.supabase
          .client
          .from('collection_files')
          .select('*', { count: 'exact', head: true })
          .eq('collection_id', collection.id);

        await io.logger.info(`Top agent: "${collection.name}" has ${count} documents`);

        await io.runTask('add-document-to-top-agent', async () => {
          const metadata = file.metadata;

          await addDocumentToTopAgent(collection.id, { id: file.id, metadata }, count === 1);

          return 'Vector index updated';
        });
      }
    }
  },
});

client.defineJob({
  id: "remove-document-from-top-agent",
  name: "Top Agent Document Removal",
  version: "1.0.0",
  trigger: db.onDeleted({
    schema: "public",
    table: "collection_files",
  }),
  integrations: {
    supabase,
  },
  run: async (payload, io, ctx) => {
    const { data: collection, error } = await io.supabase
      .client
      .from('collections')
      .select('*')
      .eq('id', payload.old_record.collection_id)
      .single();

    if (error) {
      // collection was deleted and that's handled by destroy-top-agent job
      await io.logger.info('Ignore as collection not present');
    } else {
      if (collection.top_agent) {
        const { data: file, error } = await io.supabase
          .client
          .from('files')
          .select('*')
          .eq('id', payload.old_record.file_id)
          .single();

        if (error) {
          // file was deleted and that's handled by destroy-document-agent job
          // but we still need to remove the related file nodes from the top agent
          // and we don't know if the file was a document agent
          await io.logger.info('Cleanup of possible document agents for a file');

          await io.runTask('remove-document-from-top-agent', async () => {
            await removeDocumentFromTopAgent(collection.id, payload.old_record.file_id);

            return 'Vector index updated';
          });
        } else {
          if (file.document_agent) {
            await io.logger.info(`Removing file: "${file.name}" from top agent: "${collection.name}"`);

            await io.runTask('remove-document-from-top-agent', async () => {
              await removeDocumentFromTopAgent(collection.id, payload.old_record.file_id);

              return 'Vector index updated';
            });
          }
        }
      }
    }
  },
});