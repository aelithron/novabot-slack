import type { App } from "@slack/bolt";

export default async function dailyRecap(app: App) {
  const publicRecap = await app.client.chat.postMessage({ channel: "C091A3UAXPZ", text: "hi <@U08RJ1PEM7X>, daily recap time! how was your day? :3" });
}