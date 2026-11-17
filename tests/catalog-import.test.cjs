const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { PGlite } = require('@electric-sql/pglite');
const { normalizeCatalog, validateYear, buildMigration, main } = require('../scripts/import-catalog.cjs');

test('rejects incomplete, duplicate, malformed and invalid-year catalogs', () => {
    assert.throws(() => normalizeCatalog([{ code: 'TEST 1000', name: 'Course' }]), /between/);
    assert.throws(() => normalizeCatalog([
        { code: 'TEST 1000', name: 'One' }, { code: 'test 1000', name: 'Two' },
    ], 1, 1), /Duplicate/);
    assert.throws(() => normalizeCatalog([{ code: 'bad', name: 'Course' }], 1, 1), /invalid/);
    assert.throws(() => validateYear('2026-28'), /year/);
});

test('catalog migration preserves historical IDs and escapes supplied titles', async () => {
    const db = new PGlite();
    await db.exec(`
      CREATE TABLE public.courses (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), code TEXT UNIQUE NOT NULL, name TEXT NOT NULL, is_active BOOLEAN NOT NULL DEFAULT TRUE);
      CREATE TABLE public.enrollments (course_id UUID REFERENCES public.courses(id));
      INSERT INTO public.courses (id, code, name) VALUES
        ('db300000-0000-4000-8000-000000000001', 'TEST 1000', 'Old'),
        ('db300000-0000-4000-8000-000000000002', 'TEST 1001', 'Retired');
      INSERT INTO public.enrollments VALUES ('db300000-0000-4000-8000-000000000002');
    `);
    const courses = normalizeCatalog([
        { code: 'test 1000', name: "Student's course" },
        { code: 'TEST 1002', name: "Name'); DROP TABLE public.courses; --" },
    ], 1, 1);
    await db.exec(buildMigration(courses, '2026-27'));
    const { rows } = await db.query('SELECT code, id::text, name, is_active FROM public.courses ORDER BY code');
    assert.equal(rows[0].id, 'db300000-0000-4000-8000-000000000001');
    assert.equal(rows[0].name, "Student's course");
    assert.equal(rows[1].is_active, false);
    assert.equal(rows[2].name, "Name'); DROP TABLE public.courses; --");
    assert.equal((await db.query('SELECT count(*)::int AS count FROM public.enrollments')).rows[0].count, 1);
    await db.close();
});

test('refuses to overwrite output files and removes only its own partial output', () => {
    const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'studysesh-catalog-'));
    const input = path.join(directory, 'input.json');
    const sql = path.join(directory, 'new.sql');
    const json = path.join(directory, 'existing.json');
    try {
        fs.writeFileSync(input, JSON.stringify([{ code: 'TEST 1000', name: 'Course' }]));
        fs.writeFileSync(json, 'existing');
        assert.throws(() => main(['--input', input, '--sql', sql, '--json', json, '--year', '2026-27', '--minimum', '1', '--min-prefixes', '1']));
        assert.equal(fs.existsSync(sql), false);
        assert.equal(fs.readFileSync(json, 'utf8'), 'existing');
    } finally {
        fs.unlinkSync(input);
        fs.unlinkSync(json);
        fs.rmdirSync(directory);
    }
});
