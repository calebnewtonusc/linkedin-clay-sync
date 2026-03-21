import { existsSync, readFileSync, writeFileSync } from "fs";
import { homedir } from "os";
import { join } from "path";

const CONFIG_PATH = join(homedir(), ".linkedin-clay-sync.json");

export interface Config {
  clayWebhookUrl: string;
  linkedinExportDir?: string;
  lastSyncedAt?: string;
  syncedIds: string[];
}

export function loadConfig(): Config {
  if (!existsSync(CONFIG_PATH)) {
    return {
      clayWebhookUrl: process.env.CLAY_WEBHOOK_URL ?? "",
      syncedIds: [],
    };
  }
  return JSON.parse(readFileSync(CONFIG_PATH, "utf-8"));
}

export function saveConfig(config: Config) {
  writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2));
}
