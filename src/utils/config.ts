import fs from "fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import * as z from "zod";
import { getApp } from "../index.js";

export const Config = z.object({
  owner: z.object({
    userID: z.string(),
    email: z.string(),
    timezone: z.string()
  }),
  channels: z.object({
    public: z.string(),
    private: z.string()
  }),
  recapCron: z.string(),
  recapReminderCron: z.string().nullable()
});
export default async function loadConfig(): Promise<z.Infer<typeof Config>> {
  const configPath = path.join(path.dirname(fileURLToPath(import.meta.url)), '../../config/config.json');
  try {
    await fs.access(configPath, fs.constants.F_OK | fs.constants.R_OK);
  } catch {
    getApp().logger.warn("config - default config is missing, copying...");
    await fs.mkdir(path.dirname(configPath), { recursive: true });
    await fs.copyFile(path.join(path.dirname(fileURLToPath(import.meta.url)), "../../example.config.json"), configPath, fs.constants.COPYFILE_EXCL);
  }
  return Config.parse(JSON.parse(await fs.readFile(configPath, "utf8")));
}