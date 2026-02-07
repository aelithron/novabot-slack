import { App } from "@slack/bolt";
import dotenv from "dotenv";

let app: App;
async function startApp() {
  dotenv.config({ quiet: true });
  if (!process.env.SLACK_BOT_TOKEN) throw new Error('"SLACK_BOT_TOKEN" environment variable is missing!');
  if (process.env.SOCKET_MODE) {
    if (!process.env.SLACK_APP_TOKEN) throw new Error('"SLACK_APP_TOKEN" environment variable is missing, and Socket Mode is on!');
    app = new App({
      token: process.env.SLACK_BOT_TOKEN,
      socketMode: true,
      appToken: process.env.SLACK_APP_TOKEN,
    });
  }
  await app.start();
  app.logger.info("⚡️ Bolt app is running!");
}
startApp();