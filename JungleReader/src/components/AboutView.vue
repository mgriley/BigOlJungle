<script setup>
</script>

<template>
  <div class="AboutView">
    <div class="MainInfo">
      <h1>About</h1>
      <p class="Emphasis">
      JungleReader is a free+open-source web reader.
      </p>
      <p>
      It's made to help you keep up with the sites you like,
      whatever they may be.

      Out of the box, it supports RSS, Mastodon, YouTube, and more. It has a flexible plugin system designed to let devs
      add support for almost any other site or data source.
      </p>
      <p>
      Your data and reader config are stored locally in your browser. The data should stay
      around even if you clear your browser's cookies / data, but make sure to export your config sometimes. Cloud backup & sync is coming soon.
      </p>
      <p>
      To add JungleReader support to your own website, go to <router-link to="/getread">Get Read</router-link>.
      </p>
    </div>
    <div class="MoreInfo">
      <h4>More</h4>
      <p>
      I develop this site in my spare time, hope you like it! I have more 
      open-source web projects planned (JungleWriter, JungleServer, JungleWire, JungleMask, ...), so stay tuned.
      </p>
      <div class="ExtraWidgets">
        <ul>
          <li><p><a class="LinkButton" href="https://forms.gle/HqavrHa7jQs4aRbd8" target="_blank">Leave feedback, report bugs, or request features</a></p></li>
          <li><p><a class="LinkButton" href="https://dashboard.mailerlite.com/forms/572243/97615844706617024/share" target="_blank">Subscribe to Development Newsletter</a></p></li>
          <li><p><a class="LinkButton" href="https://github.com/sponsors/mgriley" target="_blank">Sponsor on GitHub</a></p></li>
        </ul>
      </div>
    </div>
    <div class="MoreInfo">
      <h4>Image Credits</h4>
      <p>
      TODO - put the SVG image credits here.
      </p>
    </div>
  </div>
</template>

<style scoped>
.MainInfo p {
  margin-bottom: 20px;
}

.Emphasis {
  font-weight: bold;
  font-size: 1.2rem;
}

.MoreInfo {
  margin-top: 60px;
}

.Other {
  margin-top: 40px;
}

.Newsletter {
  margin-bottom: 20px;
}

.SponsorFrame {
  margin-top: 20px;
}

.ExtraWidgets {
  margin-top: 40px;
}

</style>
