export interface PushJob {
  id: string;
  lease_id: string;
  token: string;
  activity_id: string;
  activity_type: string;
  ticket_id: string | null;
}

export interface PushResult {
  action: 'accepted' | 'delivered' | 'receipt_wait' | 'retry' | 'failed' | 'invalid_device';
  ticket?: string;
  error?: string;
}

export async function authorizePushWorker(actual: string, expected: string | undefined): Promise<'ok' | 'unauthorized' | 'unconfigured'> {
  if (!expected || expected.length < 32) return 'unconfigured';
  const encoder = new TextEncoder();
  const [left, right] = await Promise.all([
    crypto.subtle.digest('SHA-256', encoder.encode(actual)),
    crypto.subtle.digest('SHA-256', encoder.encode(expected)),
  ]);
  const a = new Uint8Array(left);
  const b = new Uint8Array(right);
  let difference = 0;
  for (let i = 0; i < a.length; i++) difference |= a[i] ^ b[i];
  return difference === 0 ? 'ok' : 'unauthorized';
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function classifyError(value: unknown): PushResult {
  const details = isRecord(value) && isRecord(value.details) ? value.details : null;
  const code = typeof details?.error === 'string' ? details.error : '';
  if (code === 'DeviceNotRegistered') return { action: 'invalid_device' };
  if (code === 'MessageRateExceeded') return { action: 'retry', error: 'Expo rate limit exceeded.' };
  return { action: 'failed', error: code ? `Expo delivery error: ${code}` : 'Expo rejected the notification.' };
}

export async function deliverPushJob(
  job: PushJob,
  fetcher: typeof fetch = fetch,
  accessToken?: string,
): Promise<PushResult> {
  const receipt = job.ticket_id !== null;
  const url = receipt
    ? 'https://exp.host/--/api/v2/push/getReceipts'
    : 'https://exp.host/--/api/v2/push/send';
  const category = job.activity_type === 'message' ? 'message'
    : job.activity_type.startsWith('connection_') ? 'connection' : 'board';
  const labels = {
    message: ['New message', 'Open studysesh to see your message.'],
    connection: ['Connection update', 'Open studysesh to see your connection update.'],
    board: ['Board activity', 'Open studysesh to see your board activity.'],
  };
  const payload = receipt ? { ids: [job.ticket_id] } : {
    to: job.token,
    title: labels[category][0],
    body: labels[category][1],
    sound: 'default',
    channelId: 'default',
    data: { activityId: job.activity_id },
  };
  const headers: Record<string, string> = { 'Content-Type': 'application/json', Accept: 'application/json' };
  if (accessToken) headers.Authorization = `Bearer ${accessToken}`;
  let response: Response;
  try {
    response = await fetcher(url, { method: 'POST', headers, body: JSON.stringify(payload), signal: AbortSignal.timeout(5000) });
  } catch {
    return receipt ? { action: 'receipt_wait' } : { action: 'retry', error: 'Expo could not be reached.' };
  }
  if (!response.ok) {
    if (response.status === 429 || response.status >= 500) {
      return receipt ? { action: 'receipt_wait' } : { action: 'retry', error: `Expo returned HTTP ${response.status}.` };
    }
    return { action: 'failed', error: `Expo returned HTTP ${response.status}.` };
  }
  let body: unknown;
  try {
    body = await response.json();
  } catch {
    return receipt ? { action: 'receipt_wait' } : { action: 'retry', error: 'Expo response could not be confirmed.' };
  }
  if (!isRecord(body) || !isRecord(body.data)) {
    return receipt ? { action: 'receipt_wait' } : { action: 'retry', error: 'Expo response could not be confirmed.' };
  }
  const result = job.ticket_id === null ? body.data : body.data[job.ticket_id];
  if (!isRecord(result)) return receipt ? { action: 'receipt_wait' } : { action: 'retry', error: 'Expo response could not be confirmed.' };
  if (result.status === 'error') return classifyError(result);
  if (result.status !== 'ok') return receipt ? { action: 'receipt_wait' } : { action: 'retry', error: 'Expo response could not be confirmed.' };
  if (receipt) return { action: 'delivered' };
  return typeof result.id === 'string' && result.id.length > 0
    ? { action: 'accepted', ticket: result.id }
    : { action: 'retry', error: 'Expo did not return a delivery ticket.' };
}
