<script setup>
import { ref, onMounted, computed } from 'vue'
import { gApp, FetchMethod, FeedGroup, Feed } from '../State.js'

let showExtDetails = ref(false);

function onSetupDone() {
  gApp.setDoneWelcome(true);
  // window.scrollTo(0, 0);
  // gApp.toast({message: 'Setup Done!'});
}

</script>

<template>
  <div class="SetupHelp">
    <h1 class="PageHeader">Welcome!</h1>
    <div class="HelpStep">
      <p>
      JungleReader is a free and open-source web reader. It's made to help you keep up with the sites you like.
      Out of the box, it supports RSS, Mastodon, YouTube, Reddit, and more. Let's get started!
      </p>
      <p class="Emphasis MobileWarning">
      It looks like you're on mobile. JungleReader only supports desktop, so please come back later :)
      </p>
    </div>
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
      <button class="TextButton" @click="showExtDetails = !showExtDetails">Why do I need this extension?</button>
      <template v-if="showExtDetails">
        <p class="DisclosureBody">
        JungleReader works by fetching webpages and feeds from other websites and showing their contents here. The JungleExt browser extension handles this.
        When you install JungleExt, it will ask for permission to access all your site data. JungleExt requires this permission so that it can make web requests to
        any other website you may choose. The extension does not do anything beyond handling simple web requests. If you'd like to inspect the code, you can view 
        it on GitHub or install the extension as a zip (instructions on GitHub).
        </p>
      </template>
    </div>
    <div class="HelpStep">
      <h3>Step 2: Add a feed</h3>
      <p>
      Scroll down and click "Add Feed". Name the feed "Creating Games", set the feed type to <b>YouTube</b>, and set
      the URL to <b>www.youtube.com/@sora_sakurai_en</b>. Click the new feed to see its content.
      </p>
    </div>
    <div class="HelpStep">
      <h3>You're done!</h3>
      <p>
      From here:
      </p>
      <ol>
        <li>Add feeds for each site you'd like to follow</li>
        <li>Check out the <router-link to="/explore">"Explore"</router-link> tab for suggestions</li>
        <li>If you're a developer, check out the Plugins page</li>
      </ol>
      <button class="DoneBtn" @click="onSetupDone">Done!</button>
    </div>
  </div>
</template>

<style scoped>
.SetupHelp {
  padding-bottom: 40px;
  border-bottom: 1px solid var(--mute-text);
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
  margin-bottom: var(--space-l);
}

</style>
