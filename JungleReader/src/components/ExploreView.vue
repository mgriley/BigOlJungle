<script setup>
import { gApp, FeedGroup, Feed } from '../State.js'

let exploreData = [
  {
    group: "Try some",
    feeds: [
      {name: 'TerenceTaoTest', type: 'Mastodon', url: 'https://mathstodon.xyz/@tao'},
    ]
  }
]
</script>

<template>
  <div class="ExploreView">
    <h1 class="PageHeader">Explore</h1>
    <p>Here are some feeds you can add to get started:</p>
    <p>To add JungleReader support to your own website, go to <router-link to="/getread">Get Read</router-link>.</p> 
    <div v-for="group in exploreData">
      <button v-for="feed in group.feeds" @click="$router.replace({path: '/addfeed', query: {name: feed.name, type: feed.type, url: feed.url}})">{{ feed.name }}</button>
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
