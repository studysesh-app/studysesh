const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');
const React = require('react');
const { act, create } = require('react-test-renderer');

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

function row(index) {
    return {
        id: String(index).padStart(3, '0'),
        type: 'board_like',
        actor_id: 'actor',
        reference_id: null,
        course_code: 'TEST 1000',
        is_read: false,
        created_at: new Date(1700000000000).toISOString(),
        actor: { name: 'Student' },
    };
}

function setup(initialRows) {
    const state = { rows: [...initialRows], callback: null, failMore: false };
    class Query {
        constructor() { this.filters = {}; this.after = null; this.maximum = Infinity; this.head = false; }
        select(_fields, options) { this.head = !!options?.head; return this; }
        eq(key, value) { this.filters[key] = value; return this; }
        order() { return this; }
        limit(value) { this.maximum = value; return this; }
        or(value) {
            const match = value.match(/^created_at\.lt\.(.*),and\(created_at\.eq\..*,id\.lt\.(.*)\)$/);
            assert.ok(match);
            this.after = { date: match[1], id: match[2] };
            return this;
        }
        result() {
            if (this.after && state.failMore) return { data: null, error: { message: 'Network error' } };
            let rows = state.rows.filter((item) =>
                (!this.filters.id || item.id === this.filters.id)
                && (this.filters.is_read === undefined || item.is_read === this.filters.is_read));
            if (this.after) rows = rows.filter((item) => item.created_at < this.after.date
                || (item.created_at === this.after.date && item.id < this.after.id));
            rows.sort((a, b) => b.created_at.localeCompare(a.created_at) || b.id.localeCompare(a.id));
            return this.head ? { count: rows.length, error: null } : { data: rows.slice(0, this.maximum), error: null };
        }
        then(resolve, reject) { return Promise.resolve(this.result()).then(resolve, reject); }
        maybeSingle() { const result = this.result(); return Promise.resolve({ ...result, data: result.data?.[0] ?? null }); }
    }
    const supabase = {
        from: () => new Query(),
        channel: () => ({
            on(_type, _filter, callback) { state.callback = callback; return this; },
            subscribe() { return this; },
        }),
        removeChannel() {},
    };
    const source = fs.readFileSync(path.join(__dirname, '..', 'hooks', 'useActivity.ts'), 'utf8');
    const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
    const exports = {};
    const localRequire = (name) => {
        if (name === '../lib/supabase') return { supabase };
        if (name === '../lib/demo') return { DEMO_MODE: false };
        if (name === '../lib/time') return { timeAgo: () => 'recently' };
        return require(name);
    };
    new Function('require', 'exports', compiled)(localRequire, exports);
    return { state, useActivity: exports.useActivity };
}

test('paginates activity, retries failures and preserves loaded rows on realtime inserts', async () => {
    const { state, useActivity } = setup(Array.from({ length: 65 }, (_, i) => row(i + 1)));
    let hook;
    function Component() { hook = useActivity('user'); return null; }
    let renderer;
    await act(async () => { renderer = create(React.createElement(Component)); });
    assert.equal(hook.activities.length, 30);
    assert.equal(hook.unreadCount, 65);
    assert.equal(hook.hasMore, true);
    state.failMore = true;
    await act(async () => { await hook.loadMore(); });
    assert.equal(hook.activities.length, 30);
    assert.equal(hook.loadMoreError, 'Network error');
    state.failMore = false;
    await act(async () => { await hook.loadMore(); });
    assert.equal(hook.activities.length, 60);
    state.rows.push(row(66));
    await act(async () => { await state.callback({ eventType: 'INSERT', new: { id: '066' } }); });
    assert.equal(hook.activities.length, 61);
    assert.equal(hook.activities[0].id, '066');
    assert.equal(hook.unreadCount, 66);
    await act(async () => { await hook.loadMore(); });
    assert.equal(hook.activities.length, 66);
    assert.equal(hook.hasMore, false);
    assert.equal(new Set(hook.activities.map((item) => item.id)).size, 66);
    state.rows = state.rows.filter((item) => item.id !== '066');
    await act(async () => { await state.callback({ eventType: 'DELETE', old: { id: '066' } }); });
    assert.equal(hook.activities.length, 65);
    assert.equal(hook.unreadCount, 65);
    assert.equal(hook.activities.some((item) => item.id === '066'), false);
    await act(async () => { renderer.unmount(); });
});
