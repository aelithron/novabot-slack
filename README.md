# NovaBot - Slack ![IMG](https://hackatime-badge.hackclub.com/U08RJ1PEM7X/novabot-slack)
Nova's personal bot for Slack! \
This project was made for Hack Club [Flavortown](https://flavortown.hackclub.com)! \
<a href="https://notbyai.fyi" target="_blank">
  <img src="https://raw.githubusercontent.com/aelithron/novabot-slack/refs/heads/main/not-by-ai.svg" alt="Developed by a human, not by AI!">
</a>

## Features
### Daily Recaps
The bot automatically posts a public message for me to talk about how my day went. It also automatically shows my status from [Universal Status](https://status.novatea.dev), a previous project of mine. \
Once I respond to the public recap and mark it as done, it automatically posts a message in my private channel for me to give a more detailed recap. \
The bot also reminds me 10 minutes before a recap, so I can prepare and send it on time.
### Channel Requests
A command (by default `/spacetime`) lets users request to join my private channel. This was inspired by join workflows in the Hack Club Slack, but mine has the ability to deny channel invites as well. It also doesn't allow users already in the channel to request to join it (which just produces unnecessary messages).
### Ping Reminders
People use user groups a lot in Slack personal channels. However, if people reply to a user group ping, it pings everyone again. This can quickly get annoying, so the bot will tell people to not thread on user group mentions through an ephemeral ("only visible to you") message.
### Automatic Threadable Messages
Somewhat in the same vein, if anyone in a channel with the bot pings a user group and includes the thread (🧵) emoji, the bot will send a message below that can be safely threaded on. This helps make threading easier, and makes it harder for people to forget and ping the entire user group again.
## Usage
Right now, you can use the bot in [#novabot-playground](https://hackclub.enterprise.slack.com/archives/C0ADSBWENAY) if you are in the Hack Club Slack.
### Self-Hosting
Some steps on how to self host the bot!
1. Set up an app on [Slack's API portal](https://api.slack.com/apps). You can use the manifest in [`slack-manifest.json`](https://raw.githubusercontent.com/aelithron/novabot-slack/refs/heads/main/slack-manifest.json), feel free to change it as you wish.
2. Decide if you want to use Socket Mode. It means you don't need to open a port, but it's slower and generally not recommended for production. The manifest currently has it enabled by default, though.
3. Deploy the app, following the instructions below for your platform choice. Then, skip down to step 4. Make sure you replace the placeholders with the appropriate values from the Slack API portal.
#### With Docker Compose
Save the following Compose file as `compose.yml` (making sure to fill in the placeholders):
```yaml
services:
  novabot-slack:
    image: ghcr.io/aelithron/novabot-slack:latest
    container_name: novabot-slack
    restart: unless-stopped
    environment:
      SLACK_BOT_TOKEN: (insert bot token here)
      # if not using Socket Mode (default):
      SOCKET_MODE: false
      SLACK_SIGNING_SECRET: (insert signing secret here)

      # if using Socket Mode:
      # SOCKET_MODE: true
      # SLACK_APP_TOKEN: (insert app token here)
    ports:
      - 3000:3000 # you can remove this if using Socket Mode
    volumes:
      - ./config:/config
```
#### With `docker run`
Run this command in your terminal if you are using Socket Mode (filling in the empty spaces):
```bash
docker run -d \
  --name novabot-slack \
  -e SLACK_BOT_TOKEN="" \
  -e SLACK_APP_TOKEN="" \
  -e SOCKET_MODE=true \
  -v "$(pwd)/config:/config" \
  --restart unless-stopped \
  ghcr.io/aelithron/novabot-slack:latest
```
Alternatively, run this command if you are not using Socket Mode (once again, filling in the empty spaces):
```bash
docker run -d \
  --name novabot-slack \
  -e SLACK_BOT_TOKEN="" \
  -e SLACK_SIGNING_SECRET="" \
  -e SOCKET_MODE=false \
  -p 3000:3000 \
  -v "$(pwd)/config:/config" \
  --restart unless-stopped \
  ghcr.io/aelithron/novabot-slack:latest
```
4. Edit the config file to match your details. This should automatically generate when you start the bot for the first time.

*Want to check out the Discord version? [NovaBot Discord](https://github.com/aelithron/novabot)*
