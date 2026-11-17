const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');
const React = require('react');
const { act, create } = require('react-test-renderer');

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

function loadHook(rpc) {
    const source = fs.readFileSync(path.join(__dirname, '..', 'hooks', 'useClassmates.ts'), 'utf8');
    const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
    const exports = {};
    const localRequire = (name) => {
        if (name === '../lib/supabase') return { supabase: { rpc } };
        if (name === '../lib/demo') return { DEMO_MODE: false };
        return require(name);
    };
    new Function('require', 'exports', compiled)(localRequire, exports);
    return exports.useClassmates;
}

function row(index) {
    return {
        id: String(index).padStart(3, '0'),
        name: `Student ${index}`,
        pronouns: [],
        gender: 'Woman',
        year: null,
        major: null,
        photo_url: null,
        bio: null,
        shared_courses: ['TEST 1000'],
        prompts: [],
    };
}

test('loads stable pages and retries a failed load without losing existing profiles', async () => {
    const calls = [];
    let failure = true;
    const useClassmates = loadHook(async (_name, args) => {
        calls.push(args);
        if (!args.p_after) return { data: Array.from({ length: 31 }, (_, i) => row(i + 1)), error: null };
        if (failure) return { data: null, error: { message: 'Network error' } };
        return { data: Array.from({ length: 5 }, (_, i) => row(i + 31)), error: null };
    });
    let hook;
    function Component() {
        hook = useClassmates('user');
        return null;
    }

    let renderer;
    await act(async () => { renderer = create(React.createElement(Component)); });
    assert.equal(hook.classmates.length, 30);
    assert.equal(hook.hasMore, true);
    await act(async () => { await hook.loadMore(); });
    assert.equal(hook.classmates.length, 30);
    assert.equal(hook.loadMoreError, 'Network error');
    failure = false;
    await act(async () => { await hook.loadMore(); });
    assert.equal(hook.classmates.length, 35);
    assert.equal(hook.hasMore, false);
    assert.equal(hook.loadMoreError, null);
    assert.deepEqual(calls.map((args) => args.p_after), [null, '030', '030']);
    await act(async () => { renderer.unmount(); });
});

test('ignores a stale response after the account changes', async () => {
    let resolveOld;
    let count = 0;
    const useClassmates = loadHook(() => {
        count++;
        if (count === 1) return new Promise((resolve) => { resolveOld = resolve; });
        return Promise.resolve({ data: [row(100)], error: null });
    });
    let hook;
    function Component({ userId }) {
        hook = useClassmates(userId);
        return null;
    }
    let renderer;
    await act(async () => { renderer = create(React.createElement(Component, { userId: 'old' })); });
    await act(async () => { renderer.update(React.createElement(Component, { userId: 'new' })); });
    assert.equal(hook.classmates[0].id, '100');
    await act(async () => { resolveOld({ data: [row(1)], error: null }); });
    assert.equal(hook.classmates[0].id, '100');
    await act(async () => { renderer.unmount(); });
});
