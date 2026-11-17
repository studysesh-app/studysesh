const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');

const source = fs.readFileSync(path.join(__dirname, '..', 'supabase', 'functions', '_shared', 'push_delivery.ts'), 'utf8');
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
const exportsObject = {};
new Function('exports', compiled)(exportsObject);

function job(ticket = null) {
    return { id: 'job', lease_id: 'lease', token: 'ExpoPushToken[test-device]', activity_id: 'activity', activity_type: 'message', ticket_id: ticket };
}

test('requires a configured worker secret and rejects incorrect secrets', async () => {
    const secret = 'a'.repeat(32);
    assert.equal(await exportsObject.authorizePushWorker('', undefined), 'unconfigured');
    assert.equal(await exportsObject.authorizePushWorker('short', 'short'), 'unconfigured');
    assert.equal(await exportsObject.authorizePushWorker('wrong', secret), 'unauthorized');
    assert.equal(await exportsObject.authorizePushWorker(secret, secret), 'ok');
});

test('sends a generic notification and records its Expo ticket', async () => {
    let request;
    const fetcher = async (_url, options) => {
        request = JSON.parse(options.body);
        return Response.json({ data: { status: 'ok', id: 'ticket-1' } });
    };
    const result = await exportsObject.deliverPushJob(job(), fetcher);
    assert.deepEqual(result, { action: 'accepted', ticket: 'ticket-1' });
    assert.equal(request.to, 'ExpoPushToken[test-device]');
    assert.equal(request.data.activityId, 'activity');
    assert.equal(request.body, 'Open studysesh to see your message.');
    assert.equal('actor' in request.data, false);
});

test('checks receipts and removes devices only when Expo reports them unregistered', async () => {
    const ok = async () => Response.json({ data: { 'ticket-1': { status: 'ok' } } });
    const invalid = async () => Response.json({ data: { 'ticket-1': { status: 'error', details: { error: 'DeviceNotRegistered' } } } });
    const pending = async () => Response.json({ data: {} });
    assert.deepEqual(await exportsObject.deliverPushJob(job('ticket-1'), ok), { action: 'delivered' });
    assert.deepEqual(await exportsObject.deliverPushJob(job('ticket-1'), invalid), { action: 'invalid_device' });
    assert.deepEqual(await exportsObject.deliverPushJob(job('ticket-1'), pending), { action: 'receipt_wait' });
});

test('retries network and rate-limit failures without treating them as successful', async () => {
    const network = async () => { throw new Error('Offline'); };
    const rateLimit = async () => new Response(null, { status: 429 });
    assert.equal((await exportsObject.deliverPushJob(job(), network)).action, 'retry');
    assert.equal((await exportsObject.deliverPushJob(job(), rateLimit)).action, 'retry');
    assert.equal((await exportsObject.deliverPushJob(job('ticket-1'), network)).action, 'receipt_wait');
});
