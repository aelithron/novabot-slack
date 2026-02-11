import { App } from "@slack/bolt";
import dotenv from "dotenv";
import nodeCron from "node-cron";
import dailyRecap, { privateRecap } from "./recaps.js";
import type { Config } from "./utils/config.js";
import * as z from "zod";
import loadConfig from "./utils/config.js";

let app: App;
let config: z.Infer<typeof Config>;
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
      signingSecret: process.env.SLACK_SIGNING_SECRET,
      port: Number.parseInt(process.env.PORT || "3000")
    });
  }
  await app.start();
  app.logger.setName("novabot-slack");
  config = await loadConfig();
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
    if (body.user.id !== config.owner.userID) {
      await client.chat.postEphemeral({ text: `only nova can complete daily recaps, silly :sillybleh:`, channel: body.channel!.id, user: body.user.id });
      return;
    }
    await client.chat.update({ channel: body.channel!.id, ts: body.message!.ts, blocks: (body.message!.blocks as { type: string }[]).filter((block) => block.type !== "actions") });
    await client.reactions.remove({ channel: body.channel!.id, timestamp: body.message!.ts, name: "zzz" });
    await client.reactions.add({ channel: body.channel!.id, timestamp: body.message!.ts, name: "sparkles" });
    const recapMessage = await client.conversations.replies({ channel: body.channel!.id, ts: body.message!.ts });
    const permaLink = await client.chat.getPermalink({ channel: body.channel!.id, message_ts: ((recapMessage.messages!.find((msg) => msg.user === config.owner.userID) || { ts: undefined }).ts || body.message!.ts) });
    await privateRecap(app, permaLink.permalink);
  });
  app.action("private_daily_recap", async ({ action, ack, body, client }) => {
    ack();
    if (action.type !== "button" || body.type !== "block_actions") return;
    if (body.user.id !== config.owner.userID) {
      await client.chat.postEphemeral({ text: "only nova can complete daily recaps, silly :sillybleh:", channel: body.channel!.id, user: body.user.id });
      return;
    }
    await client.chat.update({ channel: body.channel!.id, ts: body.message!.ts, blocks: (body.message!.blocks as { type: string }[]).filter((block) => block.type !== "actions") });
    await client.reactions.remove({ channel: body.channel!.id, timestamp: body.message!.ts, name: "zzz" });
    await client.reactions.add({ channel: body.channel!.id, timestamp: body.message!.ts, name: "sparkles" });
    const recapMessage = await client.conversations.replies({ channel: body.channel!.id, ts: body.message!.ts });
    const permaLink = await client.chat.getPermalink({ channel: body.channel!.id, message_ts: ((recapMessage.messages!.find((msg) => msg.user === config.owner.userID) || { ts: undefined }).ts || body.message!.ts) });
    await client.chat.postMessage({ channel: body.channel!.id, markdown_text: `:cat-heart: <${permaLink.permalink}|nova's recap> is done now! <!subteam^S0AEHJ45EHE>` });
  });

  app.command("/spacetime", async ({ command, ack, client }) => {
    ack();
    if ((await client.conversations.members({ channel: config.channels.private })).members!.includes(command.user_id)) {
      await client.chat.postEphemeral({ channel: command.channel_id, user: command.user_id, text: `you're already in <#${config.channels.private}>! :3` });
      return;
    }
    await client.chat.postMessage({
      channel: config.channels.private, text: `hey <@${config.owner.userID}>! <@${command.user_id}> is requesting to join <#${config.channels.private}>.`, blocks: [
        { type: "section", text: { type: "mrkdwn", text: `hey <@${config.owner.userID}>! <@${command.user_id}> is requesting to join <#${config.channels.private}>.` } },
        {
          type: "actions", elements: [
            { type: "button", text: { type: "plain_text", emoji: true, text: ":door: open the door" }, style: "primary", value: `${command.user_id}`, action_id: "spacetime_allow" },
            { type: "button", text: { type: "plain_text", emoji: true, text: ":lock: turn away" }, style: "danger", value: `${command.user_id}`, action_id: "spacetime_reject" }
          ]
        }
      ]
    });
    await client.chat.postEphemeral({ channel: command.channel_id, user: command.user_id, text: "_you stand at the door and begin turning the knob..._\nyour request has been sent! i will dm you when it has been decided." });
  });
  app.action(/^spacetime_(allow|reject)/, async ({ action, ack, body, client }) => {
    ack();
    if (action.type !== "button" || body.type !== "block_actions") return;
    if (!action.value) {
      app.logger.error(`Action ${body.actions[0]?.action_id} didn't pass a value (when it should have given a user ID)!`);
      return;
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const blocks: any[] = (body.message!.blocks as { type: string }[]).filter((block) => block.type !== "actions");
     if (body.user.id !== config.owner.userID) {
      await client.chat.postEphemeral({ text: "only nova can allow/reject people from joining, silly :sillybleh:", channel: body.channel!.id, user: body.user.id });
      return;
    }
    if (body.actions[0]?.action_id === "spacetime_allow") {
      try {
        await client.conversations.invite({ channel: config.channels.private, users: action.value });
      } catch (e) {
        app.logger.error(`Couldn't invite ${action.value} to ${body.channel!.id}!\n${e}`);
        await client.chat.postEphemeral({ text: "error adding the user to the channel :(", channel: body.channel!.id, user: body.user.id });
        return;
      }
      blocks.push({ type: "section", text: { type: "mrkdwn", text: ":white_check_mark: _the door creaks open..._" } });
      await client.chat.update({ channel: body.channel!.id, ts: body.message!.ts, blocks });
      await client.chat.postMessage({ channel: action.value, text: `_the door creaks open..._\nyou have been allowed into <#${body.channel!.id}>!` });
    } else if (body.actions[0]?.action_id === "spacetime_reject") {
      blocks.push({ type: "section", text: { type: "mrkdwn", text: ":x: _the door remains locked..._" } });
      await client.chat.update({ channel: body.channel!.id, ts: body.message!.ts, blocks });
      await client.chat.postMessage({ channel: action.value, text: `_you try the knob, but it doesn't budge..._\nsorry, but your request to join <#${body.channel!.id}> (nova's private channel) was denied.` });
    } else app.logger.error(`Action ${body.actions[0]?.action_id} was not either of the intended values (spacetime_allow or spacetime_reject)!`);
  });
  if (config.recapReminderCron) nodeCron.schedule(config.recapReminderCron, async () => await app.client.chat.postMessage({ channel: config.owner.userID, text: "hii nova! your daily recap is in 10 minutes, you may want to get ready to send it!" }), { timezone: config.owner.timezone });
  nodeCron.schedule(config.recapCron, async () => await dailyRecap(app), { timezone: config.owner.timezone });
}
startApp();
export function getApp() { return app; }
export function getConfig() { return config; }