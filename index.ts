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
  app.message(async ({ message, client }) => {
    if ((message as unknown as { thread_ts: string }).thread_ts) {
      const originalMsg = await client.conversations.history({ channel: message.channel, latest: (message as unknown as { thread_ts: string }).thread_ts, inclusive: true, limit: 1 });
      if (originalMsg.ok && originalMsg.messages?.length === 1 && originalMsg.messages[0]?.text?.match(/!subteam\^([A-Z0-9]+)/)) {
        await client.chat.postEphemeral({ text: "hey! please don't thread on user group mentions :3", channel: message.channel, user: (message as unknown as { user: string }).user, thread_ts: (message as unknown as { thread_ts: string }).thread_ts || message.ts });
      }
    }
  });
}
startApp();