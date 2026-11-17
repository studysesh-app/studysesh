const fs = require('node:fs');
const path = require('node:path');
const { PGlite } = require('@electric-sql/pglite');

(async () => {
    const db = new PGlite();
    await db.exec(`
      CREATE ROLE authenticated; CREATE ROLE anon; CREATE ROLE service_role BYPASSRLS;
      CREATE SCHEMA auth; CREATE TABLE auth.users(id uuid PRIMARY KEY,email text);
      CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql STABLE AS $$SELECT NULLIF(current_setting('request.jwt.claim.sub',true),'')::uuid$$;
      CREATE FUNCTION auth.jwt() RETURNS jsonb LANGUAGE sql STABLE AS $$SELECT COALESCE(NULLIF(current_setting('request.jwt.claims',true),''),'{}')::jsonb$$;
      CREATE SCHEMA storage; CREATE TABLE storage.buckets(id text PRIMARY KEY,public boolean);
      INSERT INTO storage.buckets VALUES ('avatars',true),('proofs',false);
      CREATE TABLE storage.objects(bucket_id text,name text,metadata jsonb);
      CREATE FUNCTION storage.foldername(text) RETURNS text[] LANGUAGE sql AS $$SELECT string_to_array($1,'/')$$;
      ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;
      CREATE POLICY proof_select ON storage.objects FOR SELECT TO authenticated
        USING(bucket_id='proofs' AND (storage.foldername(name))[1]=auth.uid()::text);
      CREATE SCHEMA realtime;
      CREATE TABLE realtime.messages(topic text, extension text, payload jsonb, event text, private boolean);
      ALTER TABLE realtime.messages ENABLE ROW LEVEL SECURITY;
      CREATE FUNCTION realtime.topic() RETURNS text LANGUAGE sql STABLE AS $$SELECT NULLIF(current_setting('realtime.topic',true),'')$$;
      CREATE FUNCTION realtime.send(payload jsonb,event text,topic text,private boolean) RETURNS void LANGUAGE sql AS
        $$INSERT INTO realtime.messages(topic,extension,payload,event,private) VALUES(topic,'broadcast',payload,event,private)$$;
      GRANT USAGE ON SCHEMA public,auth,storage,realtime TO authenticated,anon,service_role;
      GRANT SELECT,INSERT,UPDATE,DELETE ON storage.objects TO authenticated;
      GRANT SELECT ON storage.objects TO anon;
      GRANT SELECT ON realtime.messages TO authenticated;
      GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA auth,storage,realtime TO authenticated,anon;
    `);
    await db.exec(fs.readFileSync('supabase/migrations/001_initial_schema.sql', 'utf8').split('-- 5. HELPER FUNCTIONS')[0]);
    await db.exec('GRANT SELECT,INSERT,UPDATE,DELETE ON ALL TABLES IN SCHEMA public TO authenticated;');
    const excluded = new Set(['001', '002', '004', '008']);
    for (const migration of fs.readdirSync('supabase/migrations').filter((name) => name.endsWith('.sql') && !excluded.has(name.slice(0, 3))).sort()) {
        await db.exec(fs.readFileSync(path.join('supabase/migrations', migration), 'utf8'));
    }
    for (const test of fs.readdirSync('supabase/tests').filter((name) => name.endsWith('.sql')).sort()) {
        await db.exec(fs.readFileSync(path.join('supabase/tests', test), 'utf8'));
        console.log(`${test} passed`);
    }
    await db.close();
})().catch((error) => { console.error(error.message); process.exitCode = 1; });
