<script setup>
</script>

<template>
  <div class="ExploreView">
    <h1>Explore</h1>
    <p>Here are some feeds you can add to get started:</p>
    <button @click="$router.replace({path: '/addfeed', query: {name: 'TerenceTaoTest', type: 'Mastodon', url: 'https://mathstodon.xyz/@tao'}})">TTao</button>
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
