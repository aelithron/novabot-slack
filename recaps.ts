import type { App } from "@slack/bolt";
import { getUniversalStatus } from "./utils/remote.js";
import { getConfig } from "./index.js";

export default async function dailyRecap(app: App) {
	const config = getConfig();
	let status;
	try {
		status = await getUniversalStatus(config.owner.email);
	} catch (e) {
		app.logger.error(`couldn't get the status from Universal Status!\n${e}`);
	}
	const recapBlocks: any[] = [{ type: "section", text: { type: "mrkdwn", text: `hi <@${config.owner.userID}>, daily recap time! how was your day? :3` } }];
	if (status) recapBlocks.push({ type: "section", text: { type: "mrkdwn", text: `nova's current status: *${status.emoji} ${status.status}*` } });
	recapBlocks.push({ type: "actions", elements: [{ type: "button", text: { type: "plain_text", text: ":crescent_moon: done!", emoji: true }, action_id: "public_daily_recap" }] });
	const publicRecap = await app.client.chat.postMessage({ channel: config.channels.public, text: `hi <@${config.owner.userID}>, daily recap time! how was your day? :3`, blocks: recapBlocks });
	if (!publicRecap.ok) { 
		app.logger.error(`issue with sending a daily recap!\n${publicRecap}`);
		return;
	}
	await app.client.reactions.add({ channel: publicRecap.channel!, timestamp: publicRecap.ts!, name: "zzz" });
}
export async function privateRecap(app: App, permaLink?: string) {
	const config = getConfig();
	let status = null;
	try {
		status = await getUniversalStatus(config.owner.email);
	} catch (e) {
		app.logger.error(`couldn't get the status from Universal Status!\n${e}`);
	}
	const recapBlocks: any[] = [{ type: "section", text: { type: "mrkdwn", text: `<@${config.owner.userID}>, private recap time! :3\n${permaLink ? `while you wait, you can look at <${permaLink}|the public recap>!` : ""}` } }];
	if (status) recapBlocks.push({ type: "section", text: { type: "mrkdwn", text: `nova's current status: *${status.emoji} ${status.status}*` } });
	recapBlocks.push({ type: "actions", elements: [{ type: "button", text: { type: "plain_text", text: ":crescent_moon: done!", emoji: true }, value: permaLink || "", action_id: "private_daily_recap" }] });
	const privateRecap = await app.client.chat.postMessage({ channel: config.channels.private, text: `<@${config.owner.userID}>, private recap time! :3\n${permaLink ? `while you wait, you can look at <${permaLink}|the public recap>!` : ""}`, blocks: recapBlocks });
	if (!privateRecap.ok) {
		app.logger.error(`issue with sending a private recap!\n${privateRecap}`);
		return;
	}
	await app.client.reactions.add({ channel: privateRecap.channel!, timestamp: privateRecap.ts!, name: "zzz" });
}