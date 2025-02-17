# JungleReader

This is the JungleReader web-reader. Read what you like, and skip the rest.

Available on web and iOS:
- www.zajungle.com
- Search "JungleReader" on iOS app store

# About

## Features
- Supports: RSS, Mastodon, YouTube, and Reddit
- Free + open-source under AGPL license.
- All data stored locally
- Follow blogs without RSS support
- Custom plugin support: Write custom scripts to parse websites that don't support RSS. They run locally in a sandbox within the web-app.

## Still needs:
- Twitter support
- Android app
- Sync data to cloud storage
- And so on

# Dev Guide

Dev server:
```sh
npm run dev
```

Deploy website:
```sh
npm run deploy
```

Deploy iOS:
```sh
npm run capsync # To sync changes to iOS/Android proj
npm run capopen # To open the iOS proj
```

Generate assets (splash and icon):
npx capacitor-assets generate
npm run capsync

Generate screenshots:
cd ios/App
fastlane snapshot

## Recommended IDE Setup

[VSCode](https://code.visualstudio.com/) + [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur) + [TypeScript Vue Plugin (Volar)](https://marketplace.visualstudio.com/items?itemName=Vue.vscode-typescript-vue-plugin).

## Customize configuration

See [Vite Configuration Reference](https://vitejs.dev/config/).

## Project Setup

```sh
npm install
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Compile and Minify for Production

```sh
npm run build
```

### JS-Interpreter Notes

Note that acorn_interpreter.js doesn't expose all of the required functions. For now, serve the full acorn.js and interpreter.js. Will have to minify these later.

## Tooling Notes

Uses postcss with postcss-preset-env to allow using new css syntax. Converts to plain/old CSS for browsers that don't support it. See the npm page for postcss-preset-env. It reads the "browserslist" key in package.json.

## Installing the browser extension from a zip

Some users may want to install the extension as a zip, for security or testing reasons. The addon will not auto-update. JungleReader will notify you if a new version is available.
Here's how:

Firefox:
- Download the jungleext-firefox-... zip from JungleExt/artifacts/ , and unzip.
- In a new tab, type "about:debugging" in the address bar.
- Click the "This Firefox" link.
- Click the "Load Temporary Add-on" link and select the addon folder.

Chrome:
- Download the jungleext-chrome-... zip from JungleExt/artifacts/, and unzip.
- Go to "chrome://extensions" in the address bar.
- Turn on Developer Mode
- Click "Load unpacked" and select the extension folder

## How to generate the webp images

Install the cwebp cmd-line tool. Make sure the input is a png, not jpg.

Run: cwebp -q 80 someimg.png -o someimg.webp

## Articles/Info

Articles on how to setup the domain properly in namecheap and Cloudflare Pages:
- https://www.bigcartel.com/resources/help/article/namecheap
- https://www.namecheap.com/support/knowledgebase/article.aspx/9604/2237/types-of-domain-redirects-301-302-url-redirects-url-frame-and-cname/

## Assets

Jungle background image:

Photo by Yoal Desurmont on Unsplash.

Previously:
Photo by Daniel o'dowd on Unsplash.

Small chameleon svg (CC0 license):
https://www.svgrepo.com/svg/170979/chameleon
