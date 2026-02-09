import type { App } from "@slack/bolt";

export default async function dailyRecap(app: App) {
  const publicRecap = await app.client.chat.postMessage({ channel: "C0ADSBWENAY", blocks: [
		{ type: "section", text: { type: "mrkdwn", text: "hi <@U08RJ1PEM7X>, daily recap time! how was your day? :3" } },
		{
			type: "actions",
			elements: [
				{
					type: "button",
					text: { type: "plain_text", text: ":crescent_moon: done!", emoji: true },
					value: new Date().toISOString(),
					action_id: "public_daily_recap"
				}
			]
		}
	], text: "hi <@U08RJ1PEM7X>, daily recap time! how was your day? :3" });
  if (!publicRecap.ok) throw new Error(`issue with sending a daily recap!\n${publicRecap}`);
  await app.client.reactions.add({ channel: publicRecap.channel!, timestamp: publicRecap.ts!, name: "zzz" });
}