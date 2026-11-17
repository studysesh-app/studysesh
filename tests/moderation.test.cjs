const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');
const React = require('react');
const { act, create } = require('react-test-renderer');

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

function setup() {
    const state = { allowed: true, failResolve: false, reports: Array.from({ length: 35 }, (_, index) => ({
        id: String(index + 1).padStart(3, '0'),
        reporter_id: 'reporter', reporter_name: 'Reporter', reported_id: 'subject',
        reported_name: 'Subject', reason: 'Reason', created_at: '2026-01-01T00:00:00Z',
    })).reverse() };
    const supabase = { rpc: async (name, args = {}) => {
        if (name === 'is_moderator') return { data: state.allowed, error: null };
        if (name === 'report_queue') {
            const rows = state.reports.filter((row) => !args.p_before_id || row.id < args.p_before_id);
            return { data: rows.slice(0, 31), error: null };
        }
        if (name === 'resolve_report') {
            if (state.failResolve) return { error: { message: 'Not authorized' } };
            state.reports = state.reports.filter((row) => row.id !== args.p_report_id);
            return { error: null };
        }
        throw new Error(`Unexpected RPC: ${name}`);
    } };
    const source = fs.readFileSync(path.join(__dirname, '..', 'hooks', 'useModeration.ts'), 'utf8');
    const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
    const exports = {};
    const localRequire = (name) => {
        if (name === '../lib/supabase') return { supabase };
        if (name === '../lib/demo') return { DEMO_MODE: false };
        return require(name);
    };
    new Function('require', 'exports', compiled)(localRequire, exports);
    return { state, useModeration: exports.useModeration };
}

test('paginates reports and retains a report when resolution fails', async () => {
    const { state, useModeration } = setup();
    let hook;
    function Component() { hook = useModeration('user'); return null; }
    let renderer;
    await act(async () => { renderer = create(React.createElement(Component)); });
    assert.equal(hook.isModerator, true);
    await act(async () => { await hook.refresh(); });
    assert.equal(hook.reports.length, 30);
    assert.equal(hook.hasMore, true);
    await act(async () => { await hook.loadMore(); });
    assert.equal(hook.reports.length, 35);
    state.failResolve = true;
    let result;
    await act(async () => { result = await hook.resolve('035', 'reviewed'); });
    assert.equal(result, 'Not authorized');
    assert.equal(hook.reports.length, 35);
    state.failResolve = false;
    await act(async () => { result = await hook.resolve('035', 'reviewed'); });
    assert.equal(result, null);
    assert.equal(hook.reports.length, 34);
    await act(async () => { renderer.unmount(); });
});
