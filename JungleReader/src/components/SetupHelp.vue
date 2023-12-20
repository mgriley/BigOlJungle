<script setup>
import { ref, onMounted, computed } from 'vue'
import { gApp, FetchMethod, FeedGroup, Feed } from '../State.js'
import MoreInfoText from './MoreInfoText.vue'

function onSetupDone() {
  gApp.setDoneWelcome(true);
}

function addFeed(args) {
  gApp.feedReader.addFeed(args);
  gApp.toast({message: 'Added!', type: 'success'});  
}

</script>

<template>
  <div class="SetupHelp">
    <h1 class="PageHeader">Welcome!</h1>
    <div class="HelpStep">
      <p class="EmphasisText">
      <!-- JungleReader is a free and open-source web reader. Follow <b>RSS</b>, <b>Mastodon</b>, <b>YouTube</b>, and <b>Reddit</b> all in one place. Let's get started! -->
      JungleReader is a free and open-source web reader. Follow <b>RSS</b>, <b>Mastodon</b>, <b>YouTube</b>, <b>Reddit</b>, and <b>that one random blog</b> all in one place. Let's get started!
      </p>
      <p class="MobileWarning AlertPane">
        JungleReader does not support mobile yet. Please come back on your desktop browser later :)
      </p>
    </div>
    <div class="HelpStep">
      <h3>Step 1: Install the browser extension</h3>
      <p>
      You'll need the JungleExt browser extension. This extension lets JungleReader fetch pages
      to read from other websites.
      </p>
      <div class="ExtButtonDiv">
        <a class="ExtLink" href="https://addons.mozilla.org/en-US/firefox/addon/jungleext/" target="_blank">
          <vue-feather type="download" stroke-width="2" />
          Install for Firefox
        </a>
        <a class="ExtLink" href="https://chrome.google.com/webstore/detail/jungleext/ipkgbelgehmnlfhjjedlgkpiiaicadkn" target="_blank">
          <vue-feather type="download" stroke-width="2" />
          Install for Chrome
        </a>
      </div>
      <MoreInfoText class="WhyNeed" text="Why do I need this extension?">
        JungleReader works by fetching webpages and feeds from other websites and showing them here, in one place. The JungleExt browser extension handles this.
        When you install JungleExt, it will ask for permission to access all your site data. JungleExt requires this permission so that it can make web requests to
        any other website you may choose (which is all it does). If you'd like to inspect the code, you can view 
        it on GitHub.
      </MoreInfoText>
    </div>
    <div class="HelpStep">
      <h3>Step 2: Reload the page</h3>
      <p>This gives the extension a chance to load.</p>
    </div>
    <div class="HelpStep">
      <h3>Step 3: Start Reading</h3>
      <button class="DoneBtn PrimaryButton StartReadingBtn" @click="onSetupDone">Start Reading!</button>
    </div>
  </div>
</template>

<style scoped>
.SetupHelp {
  padding-bottom: 40px;
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
  gap: var(--space-s);
  margin-bottom: var(--space-xs);
  display: flex;
}

.WhyNeed {
}

.ExtLink {
  font-size: 18px;
  text-decoration: none;
  font-weight: bold;
  background-color: var(--main-text);
  color: var(--main-bg);
  padding: 16px;
  border-radius: 2px;

  display: flex;
  align-items: center;
  gap: 8px;
}

.ExtLink:hover {
  background-color: var(--brand-color-purple);
}

.HelpStep {
  margin-bottom: var(--space-m);
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

.StartReadingBtn {
  margin-top: var(--space-xs);
}

</style>
