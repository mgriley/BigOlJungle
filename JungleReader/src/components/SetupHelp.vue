<script setup>
import { ref, onMounted, computed } from 'vue'
import { gApp, FetchMethod, FeedGroup, Feed } from '../State.js'
import MoreInfoText from './MoreInfoText.vue'

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
      JungleReader is a free and open-source web reader. Follow RSS feeds, Mastodon feeds, YouTube channels, Reddit feeds, and more. Let's get started!
      </p>
      <p class="MobileWarning">
      It looks like you're on mobile. JungleReader only supports desktop, so please come back later on desktop :)
      </p>
    </div>
    <div class="HelpStep">
      <h3>Step 1: Install the browser extension</h3>
      <p>
      You'll need the JungleExt browser extension. This extension lets JungleReader fetch pages
      to read from other websites. Reload the page once installed.
      </p>
      <div class="ExtButtonDiv Flex">
        <div>
          <a href="https://addons.mozilla.org/en-US/firefox/addon/jungleext/" target="_blank"><img src="../assets/FirefoxInstallExtBtn.png"/></a>
          <p>Install for Firefox</p>
        </div>
        <div>
          <a href="https://chrome.google.com/webstore/detail/jungleext/ipkgbelgehmnlfhjjedlgkpiiaicadkn" target="_blank"><img src="../assets/ChromeInstallExtBtn.png" /></a>
          <p>Install for Chrome</p>
        </div>
      </div>
      <MoreInfoText text="Why do I need this extension?">
        JungleReader works by fetching webpages and feeds from other websites and showing them here, in one place. The JungleExt browser extension handles this.
        When you install JungleExt, it will ask for permission to access all your site data. JungleExt requires this permission so that it can make web requests to
        any other website you may choose (which is all it does). If you'd like to inspect the code, you can view 
        it on GitHub or install the extension as a zip (instructions on GitHub).
      </MoreInfoText>
    </div>
    <div class="HelpStep">
      <h3>Step 2: Add a feed</h3>
      <p>
      Click the link below to add a feed for the YouTube channel "Masahiro Sakurai on Creating Games", about game development.
      </p>
      <p>
      <a href="http://localhost:5173/#/addfeed?name=CreatingGames&type=YouTube&url=https%3A%2F%2Fwww.youtube.com%2F%40sora_sakurai_en" @click="check">Masahiro Sakurai on Creating Games</a>
      </p>
    </div>
    <div class="HelpStep DoneStep">
      <h3>You're done!</h3>
      <p class="FromHereText">
      From here:
      </p>
      <ol class="NextStepsList">
        <li><p>Add feeds for each site you'd like to follow</p></li>
        <li><p>Check out the <router-link to="/explore">"Explore"</router-link> tab for suggestions</p></li>
        <li><p>If you're a developer, check out the Plugins page</p></li>
      </ol>
      <button class="DoneBtn PrimaryButton" @click="onSetupDone">Done!</button>
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
  margin-bottom: 24px;
}

.Emphasis {
  font-weight: bold;
  font-size: var(--h4-size);
}

.UnderlineLink {
  text-decoration: underline;
  font-weight: 500;
}

ol {
  margin: 16px 0px;
}

.AllSet {
  margin-top: 32px;
}

.DoneBtn {
  margin-top: 56px;
}

.MobileWarning {
  color: var(--main-text);
  display: none;
  background-color: var(--input-bg);
  padding: 16px;
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

.HelpStep:last-child {
  margin-bottom: 0;
}

.DoneStep .FromHereText {
  margin-bottom: 4px;
}

.NextStepsList {
  margin: 0;
}

.NextStepsList p {
  margin-bottom: 0;  
}

</style>
