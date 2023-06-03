# Twitch Ad Mute - Firefox Extension
This addon looks through your tabs and mutes any tabs with Twitch open when it plays an ad.
## How to Build
1. `npm install webextension-polyfill`
2. `npm install webpack webpack-cli @babel/core @babel/preset-env babel-loader --save-dev`
3. `npx webpack --config webpack.config.js`
4. Load as temporary extension in Firefox: https://extensionworkshop.com/documentation/develop/temporary-installation-in-firefox/
