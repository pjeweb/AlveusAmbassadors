# The Alveus Twitch Extension

A Twitch extension that helps viewers that watch [Maya Higa](https://www.twitch.tv/maya)'s Twitch streams identify and learn about the ambassadors at [Alveus](https://www.alveussanctuary.org/), Maya's wild life sanctuary.

# Demo

https://user-images.githubusercontent.com/49528805/167273992-0cbe7329-9665-4d67-a38c-5e47e9353a18.mov

# Local Set Up

1. Head up to https://dev.twitch.tv/console/extensions/create and create a new extension.
   You will need to create a new version: Select `Panel`, `Mobile` and `Video - Fullscreen` for the extension type. Leave all other settings as they are.
2. With the version created, scroll to the bottom and click on `View on Twitch and Install`.
   Install the extension on your channel and activate it.
3. Enable `allow invalid certificates for resources loaded from localhost` in Chrome: [chrome://flags/#allow-insecure-localhost](chrome://flags/#allow-insecure-localhost)
   If using Firefox, once you have started the development server, you will want to navigate to [https://localhost:8080](https://localhost:8080), click advanced and select accept the risk.
4. Copy the `.env.sample` to `.env` (which sets `HTTPS=true`, `HOST=localhost`, and `PORT=8080`)
5. Install dependencies for the project with `npm install`
6. Start the development server with `npm start`
7. To test the overlay, you will need to be live on Twitch with the extension installed.
   If you want to use an alternate account, add the account to `Testing Account Allowlist` under the `Access` tab of the extension version and install the extension on that account.

## Note

CSS files are hidden through the settings.json file in .vscode

# Converting Single-Page App to Multi-Page App

react-app-rewired-multiple-entry is used to add multiple entry points to the app. it uses the config-overrides.js file to add the entry points.

found out about it through this web link: https://gitgud.io/-/snippets/376

package link: https://www.npmjs.com/package/react-app-rewire-multiple-entry

env-cmd: used to add environment variables to the start script in package.json

# Chatbot Commands

!\[ambassador]: displays the card of the corresponding ambassador

-    Note: \[ambassador] is the first name of any ambassador (Ex: !nilla = Nilla Wafer, !snork = snork)
