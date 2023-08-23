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
    We made this site as a hobby project, hope you like it! We have more 
    web related hobby projects planned (JungleWriter, JungleServer, JungleMask, ...), so stay tuned. Here's a newletter
    if you'd like to follow along with development:
    </p>
    <p>TODO - newsletter</p>
    <p>
    To leave feedback or report bugs, go here:
    </p>
    <p>TODO - Google form</p>
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

</style>
