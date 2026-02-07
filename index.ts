import { App } from "@slack/bolt";
import dotenv from "dotenv";

let app: App;
async function startApp() {
  dotenv.config({ quiet: true });
  if (!process.env.SLACK_BOT_TOKEN) throw new Error('"SLACK_BOT_TOKEN" environment variable is missing!');
  if (process.env.SOCKET_MODE === "true") {
    if (!process.env.SLACK_APP_TOKEN) throw new Error('"SLACK_APP_TOKEN" environment variable is missing (and Socket Mode is on)!');
    app = new App({
      token: process.env.SLACK_BOT_TOKEN,
      socketMode: true,
      appToken: process.env.SLACK_APP_TOKEN,
    });
  } else {
    if (!process.env.SLACK_SIGNING_SECRET) throw new Error('"SLACK_SIGNING_SECRET" environment variable is missing (and Socket Mode is off)!');
    app = new App({
      token: process.env.SLACK_BOT_TOKEN,
      socketMode: false,
      signingSecret: process.env.SLACK_SIGNING_SECRET
    });
  }
  await app.start();
  app.logger.setName("novabot-slack");
  const selfInfo = await app.client.auth.test();
  app.logger.info(`is ready as ${selfInfo.user} (${selfInfo.user_id}) :D`);
  app.message("NovaBot Testing", async ({ message, say }) => {
    // @ts-expect-error - message.thread_ts does exist
    say({ text: "test working :3", thread_ts: message.thread_ts || message.ts });
  });
}
startApp();