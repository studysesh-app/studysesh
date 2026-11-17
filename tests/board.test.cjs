const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');
const React = require('react');
const { act, create } = require('react-test-renderer');

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

function row(index, comment = false) {
    const result = {
        id: String(index).padStart(3, '0'), author_id: 'author', author_name: 'Student',
        author_year: null, content: `Text ${index}`, created_at: '2026-01-01T00:00:00Z',
        likes: 0, is_liked: false,
    };
    return comment ? { ...result, parent_id: null } : { ...result, type: 'post', comments: 65 };
}

function setup(hookFile, hookName) {
    const state = { failMore: false, handlers: {}, rows: Array.from({ length: 65 }, (_, i) => row(i + 1, hookName === 'useComments')) };
    const supabase = {
        from: () => ({ select() { return this; }, eq() { return this; }, single: async () => ({ data: { id: 'course' }, error: null }) }),
        rpc: async (_name, args) => {
            const after = args.p_after_id, before = args.p_before_id;
            if ((after || before) && state.failMore) return { data: null, error: { message: 'Network error' } };
            const rows = state.rows.filter((item) => (!args.p_only || item.id === args.p_only)
                && (!after || item.id > after) && (!before || item.id < before));
            rows.sort((a, b) => hookName === 'useComments' ? a.id.localeCompare(b.id) : b.id.localeCompare(a.id));
            return { data: rows.slice(0, (args.p_limit ?? 30) + 1), error: null };
        },
        channel: () => ({
            on(_kind, filter, callback) { state.handlers[filter.event] = callback; return this; },
            subscribe() { return this; },
        }),
        removeChannel() {},
    };
    const source = fs.readFileSync(path.join(__dirname, '..', 'hooks', hookFile), 'utf8');
    const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
    const exports = {};
    const localRequire = (name) => {
        if (name === '../lib/supabase') return { supabase };
        if (name === '../lib/demo') return { DEMO_MODE: false };
        if (name === '../lib/time') return { timeAgo: () => 'recently' };
        return require(name);
    };
    new Function('require', 'exports', compiled)(localRequire, exports);
    return { state, hook: exports[hookName] };
}

test('paginates board posts and retries without losing loaded posts', async () => {
    const { state, hook: usePosts } = setup('usePosts.ts', 'usePosts');
    let result;
    function Component() { result = usePosts('TEST 1000', 'user'); return null; }
    let renderer;
    await act(async () => { renderer = create(React.createElement(Component)); });
    assert.equal(result.posts.length, 30);
    assert.equal(result.posts[0].id, '065');
    state.rows.push(row(66));
    await act(async () => { await state.handlers.board_change({ payload: { post_id: '066', comment_id: null, kind: 'post_insert' } }); });
    assert.equal(result.posts.length, 31);
    state.failMore = true;
    await act(async () => { await result.loadMore(); });
    assert.equal(result.loadMoreError, 'Network error');
    assert.equal(result.posts.length, 31);
    state.failMore = false;
    await act(async () => { await result.loadMore(); });
    await act(async () => { await result.loadMore(); });
    assert.equal(result.posts.length, 66);
    assert.equal(result.hasMore, false);
    state.rows.find((item) => item.id === '066').likes = 3;
    await act(async () => { await state.handlers.board_change({ payload: { post_id: '066', comment_id: null, kind: 'post_change' } }); });
    assert.equal(result.posts.find((item) => item.id === '066').likes, 3);
    await act(async () => { await state.handlers.board_change({ payload: { post_id: '066', comment_id: null, kind: 'post_remove' } }); });
    assert.equal(result.posts.length, 65);
    await act(async () => { renderer.unmount(); });
});

test('paginates comments and retains a newly submitted comment outside the loaded page', async () => {
    const { state, hook: useComments } = setup('useComments.ts', 'useComments');
    let result;
    let listener;
    const subscribe = (callback) => { listener = callback; return () => {}; };
    function Component() { result = useComments('post', 'user', subscribe); return null; }
    let renderer;
    await act(async () => { renderer = create(React.createElement(Component)); });
    assert.equal(result.comments.length, 30);
    state.rows.push(row(66, true));
    await act(async () => { await result.loadOne('066'); });
    assert.equal(result.comments.length, 31);
    await act(async () => {
        listener({ postId: 'post', commentId: '066', kind: 'comment_insert' });
    });
    assert.equal(result.comments.length, 31);
    state.failMore = true;
    await act(async () => { await result.loadMore(); });
    assert.equal(result.loadMoreError, 'Network error');
    assert.equal(result.comments.length, 31);
    state.failMore = false;
    await act(async () => { await result.loadMore(); });
    await act(async () => { await result.loadMore(); });
    assert.equal(result.comments.length, 66);
    assert.equal(result.hasMore, false);
    assert.equal(new Set(result.comments.map((item) => item.id)).size, 66);
    await act(async () => { listener({ postId: 'post', commentId: '066', kind: 'comment_remove' }); });
    assert.equal(result.comments.length, 65);
    await act(async () => { renderer.unmount(); });
});
