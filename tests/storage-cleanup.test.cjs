const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');

const source = fs.readFileSync(path.join(__dirname, '..', 'supabase', 'functions', '_shared', 'storage_cleanup.ts'), 'utf8');
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
const exportsObject = {};
new Function('exports', compiled)(exportsObject);

function bucket(initial) {
    const objects = new Set(initial);
    return {
        objects,
        async list(prefix, offset, limit) {
            const entries = new Map();
            for (const object of objects) {
                if (!object.startsWith(`${prefix}/`)) continue;
                const suffix = object.slice(prefix.length + 1);
                const [name, ...rest] = suffix.split('/');
                entries.set(name, { name, id: rest.length ? null : `id-${name}` });
            }
            return { data: [...entries.values()].sort((a, b) => a.name.localeCompare(b.name)).slice(offset, offset + limit), error: null };
        },
        async remove(paths) { paths.forEach((item) => objects.delete(item)); return { error: null }; },
    };
}

test('removes all paginated and nested user objects without touching other accounts', async () => {
    const storage = bucket([
        ...Array.from({ length: 115 }, (_, index) => `user/file-${String(index).padStart(3, '0')}`),
        'user/nested/deeper/proof.pdf', 'other/keep.jpg',
    ]);
    await exportsObject.removeUserStorage(storage, 'user');
    assert.deepEqual([...storage.objects], ['other/keep.jpg']);
});

test('reports storage failures instead of treating cleanup as successful', async () => {
    const storage = bucket(['user/photo.jpg']);
    storage.remove = async () => ({ error: { message: 'Storage unavailable' } });
    await assert.rejects(() => exportsObject.removeUserStorage(storage, 'user'), /Storage unavailable/);
    assert.equal(storage.objects.has('user/photo.jpg'), true);
});
