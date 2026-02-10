import type { App } from "@slack/bolt";
import { getUniversalStatus } from "./utils/remote.js";

export default async function dailyRecap(app: App) {
	let status;
	try {
		status = await getUniversalStatus("aelithron@gmail.com");
	} catch (e) {
		app.logger.error("Couldn't get the status from Universal Status!", e);
	}
	const publicRecap = await app.client.chat.postMessage({
		channel: "C0ADSBWENAY", text: "hi <@U08RJ1PEM7X>, daily recap time! how was your day? :3", blocks: [
			{ type: "section", text: { type: "mrkdwn", text: "hi <@U08RJ1PEM7X>, daily recap time! how was your day? :3" } },
			{ type: "section", text: { type: "mrkdwn", text: `${status ? `nova's current status: ${status.emoji} ${status.status}` : "" }` } },
			{ type: "actions", elements: [{ type: "button", text: { type: "plain_text", text: ":crescent_moon: done!", emoji: true }, action_id: "public_daily_recap" }] }
		]
	});
	if (!publicRecap.ok) { 
		app.logger.error(`issue with sending a daily recap!\n${publicRecap}`);
		return;
	}
	await app.client.reactions.add({ channel: publicRecap.channel!, timestamp: publicRecap.ts!, name: "zzz" });
}
export async function privateRecap(app: App, permaLink?: string) {
	let status;
	try {
		status = await getUniversalStatus("aelithron@gmail.com");
	} catch (e) {
		app.logger.error("Couldn't get the status from Universal Status!", e);
	}
	const privateRecap = await app.client.chat.postMessage({
		channel: "C0ADRH7KXN1", text: `<@U08RJ1PEM7X>, private recap time! :3\n${permaLink ? `while you wait, you can look at <${permaLink}|the public recap>!` : ""}`, blocks: [
			{ type: "section", text: { type: "mrkdwn", text: `<@U08RJ1PEM7X>, private recap time! :3\n${permaLink ? `while you wait, you can look at <${permaLink}|the public recap>!` : ""}` } },
			{ type: "section", text: { type: "mrkdwn", text: `${status ? `nova's current status: ${status.emoji} ${status.status}` : "" }` } },
			{ type: "actions", elements: [{ type: "button", text: { type: "plain_text", text: ":crescent_moon: done!", emoji: true }, value: permaLink || "", action_id: "private_daily_recap" }] }
		]
	});
	if (!privateRecap.ok) throw new Error(`issue with sending a private recap!\n${privateRecap}`);
	await app.client.reactions.add({ channel: privateRecap.channel!, timestamp: privateRecap.ts!, name: "zzz" });
}