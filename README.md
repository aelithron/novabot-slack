**⚠️ This project is not completed yet, and will have bugs! DO NOT use this in production.**
# NovaBot - Slack ![IMG](https://hackatime-badge.hackclub.com/U08RJ1PEM7X/novabot-slack)
Nova's personal bot for Slack! \
This project was made for Hack Club [Flavortown](https://flavortown.hackclub.com)!
## Features
### Daily Recaps
The bot automatically posts a public message for me to talk about how my day went. It also automatically shows my status from [Universal Status](https://status.novatea.dev), a previous project of mine. \
Once I respond to the public recap and mark it as done, it automatically posts a message in my private channel for me to give a more detailed recap.
### Channel Requests
A command (by default `/spacetime`) lets users request to join my private channel. This was inspired by join workflows in the Hack Club Slack, but mine has the ability to deny channel invites as well. It also doesn't allow users already in the channel to request to join it (which just produces unnecessary messages).
### Ping Reminders
People use user groups a lot in Slack personal channels. However, if people reply to a user group ping, it pings everyone again. This can quickly get annoying, so the bot will tell people to not thread on user group mentions through an ephemeral ("only visible to you") message.
### Automatic Threadable Messages
Somewhat in the same vein, if anyone in a channel with the bot pings a user group and includes the thread (🧵) emoji, the bot will send a message below that can be safely threaded on. This helps make threading easier, and makes it harder for people to forget and ping the entire user group again.
## Usage
Right now, you can use the bot in [#novabot-playground](https://hackclub.enterprise.slack.com/archives/C0ADSBWENAY) if you are in the Hack Club Slack.
### Self-Hosting
Self-hosting instructions coming soon! :3