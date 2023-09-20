<script setup>
import { gApp, FeedGroup, Feed } from '../State.js'

let exploreData = [
  {
    group: "Random",
    feeds: [
      {name: 'TerenceTaoTest', type: 'Mastodon', url: 'https://mathstodon.xyz/@tao'},
      {name: 'TerenceTaoTest', type: 'Mastodon', url: 'https://mathstodon.xyz/@tao'},
    ]
  },
  {
    group: "News",
    feeds: [
      {name: 'TerenceTaoTest', type: 'Mastodon', url: 'https://mathstodon.xyz/@tao'},
    ]
  }
]
</script>

<template>
  <div class="ExploreView">
    <h1 class="PageHeader">Explore</h1>
    <p class="Info">
    Here are some feeds you can add to get started. Click to add.
    To add JungleReader support to your own website, go to <router-link class="LinkButton" to="/addsupport">Add Support</router-link>.
    </p> 
    <div v-for="group in exploreData" class="Group">
      <h3>{{ group.group }}</h3>
      <ul>
        <li v-for="feed in group.feeds">
          <button class="SmallButton Block" @click="$router.replace({path: '/addfeed', query: {name: feed.name, type: feed.type, url: feed.url}})">{{ feed.name }}</button>
        </li>
      </ul>
    </div>
  </div>
</template>

<style scoped>
.Emphasis {
  font-weight: bold;
  font-size: 1.2rem;
}

.Info {
  margin-bottom: var(--space-m);
}

.Group {
  margin-bottom: var(--space-s);
}

</style>
