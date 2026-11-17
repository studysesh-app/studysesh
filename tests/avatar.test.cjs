const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');
const React = require('react');
const { act, create } = require('react-test-renderer');

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

function compile(file, localRequire) {
    const source = fs.readFileSync(path.join(__dirname, '..', file), 'utf8');
    const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX } }).outputText;
    const exports = {};
    new Function('require', 'exports', compiled)(localRequire, exports);
    return exports;
}

test('accepts legacy project avatar URLs and rejects foreign URLs and unsafe paths', () => {
    const previous = process.env.EXPO_PUBLIC_SUPABASE_URL;
    process.env.EXPO_PUBLIC_SUPABASE_URL = 'https://project.supabase.co';
    try {
        const avatar = compile('lib/avatar.ts', require);
        const key = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa/avatar.jpg';
        assert.equal(avatar.avatarStoragePath(key), key);
        assert.equal(avatar.avatarStoragePath(`https://project.supabase.co/storage/v1/object/public/avatars/${key}?t=123`), key);
        assert.throws(() => avatar.avatarStoragePath(`https://other.example/storage/v1/object/public/avatars/${key}`));
        assert.throws(() => avatar.avatarStoragePath('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa/../secret'));
        assert.equal(avatar.isLocalImageReference('blob:local-photo'), true);
    } finally {
        if (previous === undefined) delete process.env.EXPO_PUBLIC_SUPABASE_URL;
        else process.env.EXPO_PUBLIC_SUPABASE_URL = previous;
    }
});

test('shows a retryable failure and then displays an authorized signed avatar', async () => {
    let fail = true;
    let calls = 0;
    const supabase = { storage: { from: () => ({ createSignedUrl: async () => {
        calls++;
        return fail ? { data: null, error: { message: 'Denied' } } : { data: { signedUrl: 'https://signed.example/avatar' }, error: null };
    } }) } };
    const avatarLib = compile('lib/avatar.ts', require);
    const exports = compile('components/PrivateAvatar.tsx', (name) => {
        if (name === 'react-native') return { Image: 'image' };
        if (name === '../lib/supabase') return { supabase };
        if (name === '../lib/avatar') return avatarLib;
        return require(name);
    });
    let retry;
    const fallback = (state) => {
        retry = state.retry;
        return React.createElement('fallback', { error: state.error });
    };
    let renderer;
    await act(async () => {
        renderer = create(React.createElement(exports.PrivateAvatar, {
            reference: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa/avatar.jpg', style: {}, fallback,
        }));
    });
    assert.equal(renderer.root.findByType('fallback').props.error, 'Denied');
    fail = false;
    await act(async () => { retry(); });
    assert.equal(renderer.root.findByType('image').props.source.uri, 'https://signed.example/avatar');
    assert.equal(calls, 2);
    await act(async () => { renderer.unmount(); });
});
