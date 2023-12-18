<script setup>
</script>

<template>
  <div class="AboutView">
    <div class="MainInfo">
      <h1 class="PageHeader">About</h1>
      <p class="Emphasis">
      JungleReader is a free and open-source web reader.
      </p>
      <p>
      It's made to help you keep up with the sites you like,
      whatever they may be. It supports RSS, Mastodon, YouTube, and more.
      </p>
      <p>
      One of the goals of the reader is to help readers be intentful with their time.
      You'll only see exactly what you've followed. Skim what's new, follow a link or two,
      then get outside :)
      </p>
      <p>
      It has a flexible plugin system designed to let devs
      add support for almost any other site or data source.
      </p>
      <p>
      Your data and reader config are stored locally in your browser. The data should stay
      around even if you clear your browser's cookies / data, but make sure to export your config sometimes. Cloud backup & sync is coming soon.
      </p>
      <p>
      To add JungleReader support to your own website, go to <router-link class="LinkButton" to="/addsupport">Add Support</router-link>.
      </p>
      <p>
      To follow along with development, you can follow the JungleReader development feed from the Explore view.
      </p>
      <p>
      Rough Roadmap:
      <ul>
        <li>V1 JungleWriter (simple in-browser site generator tool)</li>
        <li>V1 JungleNode (self-hosted server-side tool)</li>
        <li>JungleReader mobile apps</li>
        <li>JungleReader desktop app</li>
        <li>JungleReader cleanup+improvements (esp. plugin system)</li>
      </ul>
      </p>
    </div>
    <div class="MoreInfo">
      <h4>More</h4>
      <p>
      I develop this site in my spare time, hope you like it! I have more 
      open-source web projects planned (JungleWriter, JungleNode, ...), so stay tuned.
      </p>
      <div class="ExtraWidgets">
        <ul>
          <li><p><a class="LinkButton" href="https://forms.gle/HqavrHa7jQs4aRbd8" target="_blank">Leave feedback, report bugs, or request features</a></p></li>
        </ul>
      </div>
      <h4>Sponsor on GitHub</h4>
      <iframe src="https://github.com/sponsors/mgriley/button" title="Sponsor mgriley" height="32" width="114" style="border: 0; border-radius: 6px;"></iframe>
    </div>
    <div class="MoreInfo">
    </div>
  </div>
</template>

<style scoped>
.MainInfo p {
  margin-bottom: var(--space-m);
}

.Emphasis {
  font-weight: bold;
  font-size: var(--h4-size);
  color: white;
}

.MoreInfo {
  margin-top: var(--space-xl);
}

.Other {
  margin-top: var(--space-xl);
}

.Newsletter {
  margin-bottom: var(--space-m);
}

.SponsorFrame {
  margin-top: var(--space-m);
}

.ExtraWidgets {
  margin-top: var(--space-m);
  margin-bottom: var(--space-m);
}

</style>
