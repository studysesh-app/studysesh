const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');
const React = require('react');
const { act, create } = require('react-test-renderer');

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

function setup(permissionGranted = true) {
    const state = {
        prefs: null, calls: [], stored: new Map(), permissionGranted,
        response: null, opened: 0, cleared: 0,
    };
    const storage = {
        getItem: async (key) => state.stored.get(key) ?? null,
        setItem: async (key, value) => { state.stored.set(key, value); },
        removeItem: async (key) => { state.stored.delete(key); },
    };
    const notifications = {
        setNotificationHandler() {},
        getPermissionsAsync: async () => ({ granted: state.permissionGranted }),
        requestPermissionsAsync: async () => ({ granted: state.permissionGranted }),
        getExpoPushTokenAsync: async () => ({ data: 'ExpoPushToken[test-device]' }),
        addPushTokenListener: () => ({ remove() {} }),
        addNotificationResponseReceivedListener: () => ({ remove() {} }),
        getLastNotificationResponse: () => state.response,
        clearLastNotificationResponse: () => { state.cleared++; },
    };
    const supabase = {
        from: () => ({ select() { return this; }, eq() { return this; }, maybeSingle: async () => ({ data: state.prefs, error: null }) }),
        rpc: async (name, args) => {
            state.calls.push({ name, args });
            if (name === 'set_push_preferences') state.prefs = {
                messages: args.p_messages, connections: args.p_connections, board: args.p_board,
            };
            return { error: null };
        },
    };
    const source = fs.readFileSync(path.join(__dirname, '..', 'hooks', 'usePushNotifications.ts'), 'utf8');
    const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
    const exports = {};
    const localRequire = (name) => {
        if (name === 'react-native') return { Platform: { OS: 'ios' } };
        if (name === '@react-native-async-storage/async-storage') return { __esModule: true, default: storage };
        if (name === 'expo-constants') return { __esModule: true, default: { expoConfig: { extra: { eas: { projectId: 'project' } } } } };
        if (name === 'expo-notifications') return notifications;
        if (name === '../lib/supabase') return { supabase };
        if (name === '../lib/demo') return { DEMO_MODE: false };
        return require(name);
    };
    const previous = process.env.EXPO_PUBLIC_ENABLE_PUSH_NOTIFICATIONS;
    process.env.EXPO_PUBLIC_ENABLE_PUSH_NOTIFICATIONS = 'true';
    try { new Function('require', 'exports', compiled)(localRequire, exports); }
    finally {
        if (previous === undefined) delete process.env.EXPO_PUBLIC_ENABLE_PUSH_NOTIFICATIONS;
        else process.env.EXPO_PUBLIC_ENABLE_PUSH_NOTIFICATIONS = previous;
    }
    return { state, usePushNotifications: exports.usePushNotifications };
}

test('registers, persists preferences and unregisters a signed-out device', async () => {
    const { state, usePushNotifications } = setup();
    let hook;
    function Component() { hook = usePushNotifications('user', () => { state.opened++; }); return null; }
    let renderer;
    await act(async () => { renderer = create(React.createElement(Component)); });
    let error;
    await act(async () => { error = await hook.save({ messages: true, connections: false, board: false }); });
    assert.equal(error, null);
    assert.equal(hook.preferences.messages, true);
    assert.ok(state.calls.some((item) => item.name === 'register_push_device' && item.args.p_expected_user === 'user'));
    assert.ok(state.calls.some((item) => item.name === 'set_push_preferences' && item.args.p_messages === true));
    await act(async () => { error = await hook.unregisterCurrentDevice(); });
    assert.equal(error, null);
    assert.equal(state.stored.size, 0);
    assert.ok(state.calls.some((item) => item.name === 'unregister_push_device'));
    await act(async () => { renderer.unmount(); });
});

test('does not save enabled preferences when device permission is denied', async () => {
    const { state, usePushNotifications } = setup(false);
    let hook;
    function Component() { hook = usePushNotifications('user', () => {}); return null; }
    let renderer;
    await act(async () => { renderer = create(React.createElement(Component)); });
    let error;
    await act(async () => { error = await hook.save({ messages: true, connections: false, board: false }); });
    assert.match(error, /Allow notifications/);
    assert.equal(hook.preferences.messages, false);
    assert.equal(state.calls.some((item) => item.name === 'set_push_preferences'), false);
    await act(async () => { renderer.unmount(); });
});

test('opens Activity for a tapped push notification after sign-in', async () => {
    const { state, usePushNotifications } = setup();
    state.response = { notification: { request: { content: { data: { activityId: 'activity' } } } } };
    function Component() { usePushNotifications('user', () => { state.opened++; }); return null; }
    let renderer;
    await act(async () => { renderer = create(React.createElement(Component)); });
    assert.equal(state.opened, 1);
    assert.equal(state.cleared, 1);
    await act(async () => { renderer.unmount(); });
});
