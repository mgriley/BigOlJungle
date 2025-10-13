# 🦎 JungleReader

This is the JungleReader web-reader. Read what you like, and skip the rest.

## ✨ Features

- 🌐 **Multi-platform support:** RSS, Mastodon, YouTube, and Reddit
- 🆓 **Free + open-source** under AGPL license
- 🔒 **Privacy-focused:** All data stored locally
- 📰 **Universal compatibility:** Follow blogs without RSS support
- 🔧 **Custom plugin support:** Extend functionality with custom scripts

## 🤝 Community Add-ons

### 🦊 Jungle-Reader-Sidebar by OutshineIssue

@OutshineIssue made a sidebar add-on for Firefox. It lets you quickly jump to JungleReader without needing a browser
bookmark for it.

**Get it here:** [Jungle-Reader-Sidebar](https://github.com/OutshineIssue/Jungle-Reader-Sidebar)

## 🎯 Future Work
- 🐦 Twitter support
- 🤖 Android app
- ☁️ Sync data to cloud storage
- 🚀 And much more!


## 🛠️ Development Guide

### 🚀 Quick Start

**Development server:**
```sh
npm run dev
```

**Deploy website:**
```sh
npm run deploy
```

### 📱 Mobile Development

**Deploy iOS:**
```sh
npm run capsync # Sync changes to iOS/Android projects
npm run capopen # Open the iOS project
```

**Generate assets (splash screens and icons):**
```sh
npx capacitor-assets generate
npm run capsync
```

**Generate App Store screenshots:**
```sh
cd ios/App
fastlane snapshot
```

## 💻 Development Setup

### 🔧 Recommended IDE Setup

[VSCode](https://code.visualstudio.com/) + [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (disable Vetur) + [TypeScript Vue Plugin (Volar)](https://marketplace.visualstudio.com/items?itemName=Vue.vscode-typescript-vue-plugin)

### ⚙️ Project Setup

```sh
# Install dependencies
npm install
```

### 🏃‍♂️ Development Commands

```sh
# Compile and hot-reload for development
npm run dev

# Compile and minify for production
npm run build
```

### 📖 Configuration

See [Vite Configuration Reference](https://vitejs.dev/config/) for customization options.

## 🔧 Technical Notes

### 📝 JS-Interpreter
Note that `acorn_interpreter.js` doesn't expose all required functions. Currently serving the full `acorn.js` and `interpreter.js`. Will optimize and minify these later.

### 🎨 CSS Tooling
Uses PostCSS with `postcss-preset-env` to enable modern CSS syntax. Automatically converts to compatible CSS for older browsers. Configuration reads from the `browserslist` key in `package.json`.

## 🔌 Browser Extension Installation

Some users may want to install the extension manually for security or testing reasons. The addon will not auto-update, but JungleReader will notify you when a new version is available.

### 🦊 Firefox
1. Download `jungleext-firefox-*.zip` from `JungleExt/artifacts/` and unzip
2. Navigate to `about:debugging` in a new tab
3. Click **"This Firefox"**
4. Click **"Load Temporary Add-on"** and select the addon folder

### 🌐 Chrome
1. Download `jungleext-chrome-*.zip` from `JungleExt/artifacts/` and unzip
2. Navigate to `chrome://extensions`
3. Enable **"Developer Mode"**
4. Click **"Load unpacked"** and select the extension folder

## 🖼️ Image Processing

### WebP Generation
Install the `cwebp` command-line tool. Ensure input is PNG format (not JPG).

```sh
cwebp -q 80 input.png -o output.webp
```

## 📚 Resources

### 🌐 Domain Setup Guides
- [Namecheap Configuration](https://www.bigcartel.com/resources/help/article/namecheap)
- [Cloudflare Pages Setup](https://www.namecheap.com/support/knowledgebase/article.aspx/9604/2237/types-of-domain-redirects-301-302-url-redirects-url-frame-and-cname/)

## 🎨 Assets & Credits

### 🌴 Background Image
**Current:** Photo by Yoal Desurmont on Unsplash  
**Previous:** Photo by Daniel o'dowd on Unsplash

### 🦎 Chameleon Icon
[SVG Repo](https://www.svgrepo.com/svg/170979/chameleon) (CC0 license)
