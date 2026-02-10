import { App } from "@slack/bolt";
import dotenv from "dotenv";
import nodeCron from "node-cron";
import dailyRecap, { privateRecap } from "./recaps.js";

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
    if (message.type === "message" && message.subtype === undefined && message.thread_ts) {
      const originalMsg = await client.conversations.history({ channel: message.channel, latest: message.thread_ts, inclusive: true, limit: 1 });
      if (originalMsg.ok && originalMsg.messages?.length === 1 && originalMsg.messages[0]?.text?.match(/!subteam\^([A-Z0-9]+)/)) {
        await client.chat.postEphemeral({ text: "hey! please don't thread on user group mentions :3", channel: message.channel, user: message.user, thread_ts: message.thread_ts || message.ts });
      }
    }
  });
  app.message(":thread:", async ({ message, say }) => {
    if (message.type === "message" && message.subtype === undefined && message.text?.match(/!subteam\^([A-Z0-9]+)/) && message.thread_ts === undefined) say(":thread: thread here!");
  });

  app.action("public_daily_recap", async ({ action, ack, body, client }) => {
    ack();
    if (action.type !== "button" || body.type !== "block_actions") return;
    if (body.user.id !== "U08RJ1PEM7X") {
      client.chat.postEphemeral({ text: "only nova can complete daily recaps, silly :sillybleh:", channel: body.channel!.id, user: body.user.id });
      return;
    }
    await client.chat.update({ channel: body.channel!.id, ts: body.message!.ts, blocks: (body.message!.blocks as { type: string }[]).filter((block) => block.type !== "actions") });
    await client.reactions.remove({ channel: body.channel!.id, timestamp: body.message!.ts, name: "zzz" });
    await client.reactions.add({ channel: body.channel!.id, timestamp: body.message!.ts, name: "sparkles" });
    const recapMessage = await client.conversations.replies({ channel: body.channel!.id, ts: body.message!.ts });
    const permaLink = await client.chat.getPermalink({ channel: body.channel!.id, message_ts: ((recapMessage.messages!.find((msg) => msg.user === "U08RJ1PEM7X") || { ts: undefined }).ts || body.message!.ts) });
    await privateRecap(app, permaLink.permalink);
  });
  app.action("private_daily_recap", async ({ action, ack, body, client }) => {
    ack();
    if (action.type !== "button" || body.type !== "block_actions") return;
    if (body.user.id !== "U08RJ1PEM7X") {
      client.chat.postEphemeral({ text: "only nova can complete daily recaps, silly :sillybleh:", channel: body.channel!.id, user: body.user.id });
      return;
    }
    await client.chat.update({ channel: body.channel!.id, ts: body.message!.ts, blocks: (body.message!.blocks as { type: string }[]).filter((block) => block.type !== "actions") });
    await client.reactions.remove({ channel: body.channel!.id, timestamp: body.message!.ts, name: "zzz" });
    await client.reactions.add({ channel: body.channel!.id, timestamp: body.message!.ts, name: "sparkles" });
    const recapMessage = await client.conversations.replies({ channel: body.channel!.id, ts: body.message!.ts });
    const permaLink = await client.chat.getPermalink({ channel: body.channel!.id, message_ts: ((recapMessage.messages!.find((msg) => msg.user === "U08RJ1PEM7X") || { ts: undefined }).ts || body.message!.ts) });
    await client.chat.postMessage({ channel: body.channel!.id, markdown_text: `:cat-heart: <${permaLink.permalink}|nova's recap> is done now! <!subteam^S0AEHJ45EHE>` });
  });
  nodeCron.schedule("0 30 22 * * *", async () => await dailyRecap(app), { timezone: "America/Denver" });
  //await dailyRecap(app);
}
startApp();