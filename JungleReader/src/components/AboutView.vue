<script setup>

</script>

<template>
  <div class="AboutView">
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
    <h4 class="MoreInfo">More</h4>
    <p>
    I made this site as a hobby project, hope you like it! I have more 
    web related hobby projects planned (JungleWriter, JungleServer, JungleMask, ...), so stay tuned. Here's a newletter
    if you'd like to follow along with development:
    </p>
    <div class="ml-embedded Newsletter" data-form="KvDpFc"></div>
    <p>
    You can also leave feedback, report bugs, or request features <a href="https://forms.gle/HqavrHa7jQs4aRbd8" target="_blank" class="LinkButton">here</a>.
    </p>
  </div>
</template>

<style scoped>
.AboutView p {
  margin-bottom: 20px;
}

.Emphasis {
  font-weight: bold;
  font-size: 1.2rem;
}

.MoreInfo {
  margin-top: 80px;
}

.Other {
  margin-top: 40px;
}

.Newsletter {
  margin-bottom: 20px;
}

</style>
