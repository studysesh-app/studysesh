const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');
const React = require('react');
const { act, create } = require('react-test-renderer');

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

function message(index) {
    return {
        id: String(index).padStart(3, '0'),
        conversation_id: 'thread',
        sender_id: 'user',
        content: `Message ${index}`,
        status: 'sent',
        created_at: '2026-01-01T00:00:00.000Z',
    };
}

function setup() {
    const state = { rows: Array.from({ length: 120 }, (_, index) => message(index + 1)), failOlder: false,
        summaries: [], failSummaryPage: false, unread: 0, handlers: {} };
    class Query {
        constructor(table) { this.table = table; this.filters = {}; this.after = null; this.maximum = Infinity; this.updating = false; }
        select() { return this; }
        update() { this.updating = true; return this; }
        eq(key, value) { this.filters[key] = value; return this; }
        neq() { return this; }
        is() { return this; }
        order() { return this; }
        limit(value) { this.maximum = value; return this; }
        or(value) {
            const match = value.match(/^created_at\.lt\.(.*),and\(created_at\.eq\..*,id\.lt\.(.*)\)$/);
            assert.ok(match);
            this.after = { date: match[1], id: match[2] };
            return this;
        }
        result() {
            if (this.updating) return { error: null };
            if (this.table === 'conversation_participants') return { data: [], error: null };
            if (this.after && state.failOlder) return { data: null, error: { message: 'Network error' } };
            let rows = state.rows.filter((item) => item.conversation_id === this.filters.conversation_id);
            if (this.after) rows = rows.filter((item) => item.created_at < this.after.date
                || (item.created_at === this.after.date && item.id < this.after.id));
            rows.sort((a, b) => b.created_at.localeCompare(a.created_at) || b.id.localeCompare(a.id));
            return { data: rows.slice(0, this.maximum), error: null };
        }
        then(resolve, reject) { return Promise.resolve(this.result()).then(resolve, reject); }
    }
    const supabase = {
        from: (table) => new Query(table),
        rpc: async (name, args = {}) => {
            if (name === 'unread_message_count') return { data: state.unread, error: null };
            if (name === 'conversation_summary_page') {
                if (args.p_before_id && state.failSummaryPage) return { data: null, error: { message: 'Network error' } };
                const rows = state.summaries.filter((item) =>
                    (!args.p_only || item.id === args.p_only)
                    && (!args.p_before_id || item.sort_at < args.p_before_at
                        || (item.sort_at === args.p_before_at && item.id < args.p_before_id)))
                    .sort((a, b) => b.sort_at.localeCompare(a.sort_at) || b.id.localeCompare(a.id));
                return { data: rows.slice(0, (args.p_limit ?? 30) + 1), error: null };
            }
            return { data: null, error: null };
        },
        channel: () => ({
            on(_kind, filter, callback) { state.handlers[filter.event] = callback; return this; },
            subscribe() { return this; },
        }),
        removeChannel() {},
    };
    const source = fs.readFileSync(path.join(__dirname, '..', 'hooks', 'useChat.ts'), 'utf8');
    const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
    const exports = {};
    const localRequire = (name) => {
        if (name === '../lib/supabase') return { supabase };
        if (name === '../lib/demo') return { DEMO_MODE: false };
        if (name === '../lib/time') return { timeAgo: () => 'recently' };
        return require(name);
    };
    new Function('require', 'exports', compiled)(localRequire, exports);
    return { state, useChat: exports.useChat };
}

test('loads older messages without losing history or duplicating realtime messages', async () => {
    const { state, useChat } = setup();
    let hook;
    function Component() { hook = useChat('user'); return null; }
    let renderer;
    await act(async () => { renderer = create(React.createElement(Component)); });
    await act(async () => { assert.equal(await hook.fetchMessages('thread'), true); });
    assert.equal(hook.messagesByConversation.thread.length, 50);
    assert.equal(hook.messagesByConversation.thread[0].id, '071');
    state.failOlder = true;
    await act(async () => { await hook.loadOlderMessages('thread'); });
    assert.equal(hook.historyByConversation.thread.error, 'Network error');
    assert.equal(hook.messagesByConversation.thread.length, 50);
    state.failOlder = false;
    await act(async () => { await hook.loadOlderMessages('thread'); });
    assert.equal(hook.messagesByConversation.thread.length, 100);
    await act(async () => { await hook.loadOlderMessages('thread'); });
    assert.equal(hook.messagesByConversation.thread.length, 120);
    assert.equal(hook.historyByConversation.thread.hasMore, false);
    await act(async () => { state.handlers.INSERT({ new: message(120) }); });
    assert.equal(hook.messagesByConversation.thread.length, 120);
    await act(async () => { await hook.fetchMessages('thread'); });
    assert.equal(hook.messagesByConversation.thread.length, 120);
    assert.equal(hook.messagesByConversation.thread[0].id, '001');
    await act(async () => { renderer.unmount(); });
});

test('paginates conversation summaries while retaining the total unread count', async () => {
    const { state, useChat } = setup();
    state.summaries = Array.from({ length: 35 }, (_, index) => ({
        id: String(index + 1).padStart(3, '0'), other_user_id: 'other', other_name: 'Student',
        other_is_tutor: false, last_content: 'Hello', last_sender: 'other',
        last_at: '2026-01-01T00:00:00.000Z', sort_at: '2026-01-01T00:00:00.000Z', unread_count: 1,
    }));
    state.unread = 35;
    let hook;
    function Component() { hook = useChat('user'); return null; }
    let renderer;
    await act(async () => { renderer = create(React.createElement(Component)); });
    assert.equal(hook.conversations.length, 30);
    assert.equal(hook.unreadCount, 35);
    assert.equal(hook.hasMoreConversations, true);
    state.failSummaryPage = true;
    await act(async () => { await hook.loadMoreConversations(); });
    assert.equal(hook.conversationPageError, 'Network error');
    assert.equal(hook.conversations.length, 30);
    state.failSummaryPage = false;
    await act(async () => { await hook.loadMoreConversations(); });
    assert.equal(hook.conversations.length, 35);
    assert.equal(hook.hasMoreConversations, false);
    assert.equal(new Set(hook.conversations.map((item) => item.id)).size, 35);
    await act(async () => { renderer.unmount(); });
});
