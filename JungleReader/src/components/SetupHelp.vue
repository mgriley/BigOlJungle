<script setup>
import { ref, onMounted, computed } from 'vue'
import { gApp, FetchMethod, FeedGroup, Feed } from '../State.js'

</script>

<template>
  <div class="SetupHelp">
    <h1>Welcome!</h1>
    <p class="Emphasis">
    JungleReader is a free+open-source web reader.
    </p>
    <p>
    It's made to help you keep up with the sites you like,
    whatever they may be. Out of the box, it supports RSS, Mastodon, YouTube, Reddit, and more.
    Ever wanted to follow all the sites/blogs you like in one place? JungleReader is for you.
    </p>
    <h4>Getting Started</h4>
    <h4>Step 1: Install the Browser Extension</h4>
    <p>
    To get started, you'll have to install the JungleExt browser extension. This extension lets JungleReader fetch pages
    from other websites, so that you can read them all here. Currently, the extension is only available for Firefox. Support for Chrome and Safari
    is coming soon!
    </p>
    <h4>Option 1 - Download to Firefox from Addons Store</h4>
    <p>
    Download from the offical Firefox addons store <a class="UnderlineLink" href="https://addons.mozilla.org/en-US/firefox/addon/jungleext/" target="_blank">here</a>.
    </p>
    <h4>Option 2 - Download to Firefox from Zip</h4>
    <p>
    You can download the extension from a zip file, if you'd prefer. This way, you can open the zip and inspect the addon code before installing.
    The addon will not auto-update. JungleReader will notify you if a new version is available.
    </p>
    <p>1. Download here</p>
    <p>2. Go to blahblahblah</p>
    <h4>Addon Info</h4>
    <p>
    When you install the addon, it will ask for permission to access all your site data. JungleExt requires this permission so that it can make web requests to
    any other website you may choose. Native apps can do this by default, but websites cannot, for security reasons. I chose to make JungleReader as a webapp, so
    JungleExt is a necessary evil for now. If you'd like to inspect the addon code, you can view 
    it on GitHub or install the extension as a zip.
    </p>
    <h4>Step 2: Add Your First Feed</h4>
    <p>
    Click the "Add Feed" button. Name the feed "World News", leave the feed type as RSS, and set
    the url to "https://www.cbc.ca/webfeed/rss/rss-world" (which is the RSS feed for CBC World News).
    </p>
    <p>You should see your new feed show up below. Clicking it should take you to a page with the RSS items.</p>
    <p>
    You're all set! Experiment with "Add Group" to organize your feeds, try adding feeds of different types, and
    check out the "Plugins" page. JungleReader has a flexible plugin system that lets developers add support for many page types. If you're ever stuck,
    click the Help/Info buttons as you go. Enjoy!
    </p>
    <button class="DoneBtn">I'm Done!</button>
  </div>
</template>

<style scoped>
.SetupHelp {
  padding-bottom: 40px;
  border-bottom: 6px dashed var(--main-text);
  margin-bottom: 40px;
}

.SetupHelp p {
  margin-bottom: 20px;
}

.Emphasis {
  font-weight: bold;
  font-size: 1.2rem;
}

.UnderlineLink {
  text-decoration: underline;
  font-weight: 500;
}

.DoneBtn {
  margin-top: 50px;
}

</style>
