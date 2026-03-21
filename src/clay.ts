import type { LinkedInConnection } from "./parse.js";

const RETRY_DELAYS = [500, 1000, 2000];

async function postWithRetry(
  url: string,
  body: object,
  attempt = 0
): Promise<boolean> {
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (res.status === 429 && attempt < RETRY_DELAYS.length) {
      await new Promise((r) => setTimeout(r, RETRY_DELAYS[attempt]));
      return postWithRetry(url, body, attempt + 1);
    }

    return res.ok;
  } catch (err) {
    if (attempt < RETRY_DELAYS.length) {
      await new Promise((r) => setTimeout(r, RETRY_DELAYS[attempt]));
      return postWithRetry(url, body, attempt + 1);
    }
    return false;
  }
}

export interface SyncResult {
  sent: number;
  skipped: number;
  failed: string[];
}

export async function syncToClay(
  connections: LinkedInConnection[],
  webhookUrl: string,
  alreadySynced: Set<string>,
  onProgress?: (name: string, status: "sent" | "skipped" | "failed") => void,
  delayMs = 100
): Promise<SyncResult> {
  const result: SyncResult = { sent: 0, skipped: 0, failed: [] };

  for (const conn of connections) {
    if (alreadySynced.has(conn.submissionId)) {
      result.skipped++;
      onProgress?.(conn.name, "skipped");
      continue;
    }

    const payload = {
      submission_id: conn.submissionId,
      name: conn.name,
      first_name: conn.firstName,
      last_name: conn.lastName,
      linkedin_url: conn.linkedinUrl,
      email: conn.email,
      company: conn.company,
      position: conn.position,
      connected_on: conn.connectedOn,
      source: conn.source,
      synced_at: new Date().toISOString(),
    };

    const ok = await postWithRetry(webhookUrl, payload);
    if (ok) {
      result.sent++;
      alreadySynced.add(conn.submissionId);
      onProgress?.(conn.name, "sent");
    } else {
      result.failed.push(conn.name);
      onProgress?.(conn.name, "failed");
    }

    if (delayMs > 0) await new Promise((r) => setTimeout(r, delayMs));
  }

  return result;
}
