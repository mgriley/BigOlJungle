<script setup>
import { ref, onMounted, computed } from 'vue'
import { gApp, FetchMethod, FeedGroup, Feed } from '../State.js'

let showExtDetails = ref(false);

function onSetupDone() {
  gApp.setDoneWelcome(true);
}

</script>

<template>
  <div class="SetupHelp">
    <h1>Welcome!</h1>
    <p class="Emphasis">
    JungleReader is a free and open-source web reader.
    </p>
    <p>
    It's made to help you keep up with the sites you like,
    whatever they may be. Out of the box, it supports RSS, Mastodon, YouTube, Reddit, and more. Let's get started.
    </p>
    <p class="Emphasis MobileWarning">
    It looks like you're on mobile. JungleReader only supports desktop, so please come back later :)
    </p>
    <div class="HelpStep">
      <h3>Step 1: Install the browser extension</h3>
      <p>
      You'll need the JungleExt browser extension. This extension lets JungleReader fetch pages
      to read from other websites.
      </p>
      <div class="ExtButtonDiv Flex">
        <div>
          <a href="https://addons.mozilla.org/en-US/firefox/addon/jungleext/" target="_blank"><img src="FirefoxInstallExtBtn.png"/></a>
          <p>Install for Firefox</p>
        </div>
        <div>
          <a href="https://chrome.google.com/webstore/detail/jungleext/ipkgbelgehmnlfhjjedlgkpiiaicadkn" target="_blank"><img src="ChromeInstallExtBtn.png" /></a>
          <p>Install for Chrome</p>
        </div>
      </div>
      <a class="LinkButton" @click.prevent="showExtDetails = !showExtDetails">Why do I need this extension?</a>
      <template v-if="showExtDetails">
        <p class="DisclosureBody">
        JungleReader works by fetching webpages and feeds from other websites and showing their contents here. The JungleExt browser extension handles this.
        When you install JungleExt, it will ask for permission to access all your site data. JungleExt requires this permission so that it can make web requests to
        any other website you may choose. The extension does not actually do anything beyond handling simple web requests. If you'd like to inspect the addon code, you can view 
        it on GitHub or install the extension as a zip.
        </p>
      </template>
    </div>
    <h3>Step 2: Add Your First Feed</h3>
    Let's add some feeds.
    <ol>
      <li>
      Click the <b>Add Feed</b> button below. Name the feed "Creating Games", set the feed type to <b>YouTube</b>, and set
      the URL to <b>https://www.youtube.com/@sora_sakurai_en</b>.
      </li>
      <li>
      You should see your new feed show up in big type. Click it to see the feed content.
      </li>
      <li>
      Add another feed called "CBC World News". Leave the type as RSS and set the URL to <b>https://www.cbc.ca/webfeed/rss/rss-world</b>.
      </li>
    </ol>
    <p class="Emphasis AllSet">You're all set!</p>
    <p>
    From here, add feeds for each site you'd like to follow. The "Explore" tab has some to get you started. Experiment with "Add Group" to organize your feeds, try adding feeds of different types, and
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
  overflow-wrap: break-word;
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
  margin: 8px 0;
}

h3 {
  margin: 6px 0;
}

h4 {
  margin: 4px 0;
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

.MobileWarning {
  font-style: italic;
  display: none;
  background-color: var(--input-bg);
  padding: 10px;
}

@media (max-width: 768px) {
  .MobileWarning {
    display: block;
  }
}

.ExtButtonDiv {
  gap: var(--space-l);
}

.HelpStep {
  margin-bottom: var(--space-xl);
}

</style>
