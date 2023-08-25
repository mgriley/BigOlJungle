<script setup>
import { ref, onMounted, computed } from 'vue'
import { gApp, FetchMethod, FeedGroup, Feed } from '../State.js'

function onSetupDone() {
  gApp.setDoneWelcome(true);
}

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
    <h2>Getting Started</h2>
    <h3>Step 1: Install the Browser Extension</h3>
    <p>
    To get started, you'll have to install the JungleExt browser extension. This extension lets JungleReader fetch pages
    from other websites, so that you can read them all here. Currently, the extension is only available for Firefox. Support for Chrome and Safari
    is coming soon!
    </p>
    <h4>Option 1 - Download for Firefox from Addons Store (Recommended)</h4>
    <p>
    Download from the offical Firefox addons store <a class="UnderlineLink" href="https://addons.mozilla.org/en-US/firefox/addon/jungleext/" target="_blank">here</a>.
    </p>
    <h4>Option 2 - Download for Firefox from Zip</h4>
    <p>
    You can download the extension from a zip file, if you'd prefer. This way, you can open the zip and inspect the addon code before installing.
    The addon will not auto-update. JungleReader will notify you if a new version is available.
    </p>
    <ol>
      <li>Download here</li>
      <li>Go to blahblahblah</li>
    </ol>
    <h4>About the Extension</h4>
    <p>
    When you install JungleExt, it will ask for permission to access all your site data. JungleExt requires this permission so that it can make web requests to
    any other website you may choose. Websites cannot normally do this, for security reasons. If you'd like to inspect the addon code, you can view 
    it on GitHub or install the extension as a zip.
    </p>
    <h3>Step 2: Add Your First Feed</h3>
    Let's add some feeds.
    <ol>
      <li>
      Click the <b>Add Feed</b> button below. Name the feed "World News", leave the feed type as <b>RSS</b>, and set
      the URL to <b>https://www.cbc.ca/webfeed/rss/rss-world</b> (which is the RSS feed for CBC World News).
      </li>
      <li>You should see your new feed show up in big type. Click it to see the feed content.</li>
      <li>
      Add another feed called "Creating Games". Set the type to <b>YouTube</b> and the URL to
      <b>https://www.youtube.com/@sora_sakurai_en</b>.
      </li>
    </ol>
    <p class="Emphasis AllSet">You're all set!</p>
    <p>
    From here, add feeds for each site you'd like to follow. Experiment with "Add Group" to organize your feeds, try adding feeds of different types, and
    check out the "Plugins" page. JungleReader has a flexible plugin system that lets developers add support for many page types. If you're ever stuck,
    click the Help/Info buttons as you go. Enjoy!
    </p>
    <button class="DoneBtn" @click="onSetupDone">I'm Done!</button>
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

h2 {
  font-size: 1.75rem;
  line-height: 1.75;
}

h3 {
  line-height: 1.75;
}

h4 {
  line-height: 1.5;
}

ol {
  margin: 15px 0px;
}

.AllSet {
  margin-top: 30px;
}

.DoneBtn {
  margin-top: 20px;
}


</style>
