<script setup>

import { ref, onMounted, computed } from 'vue'
import { gApp, FeedGroup, Feed } from '../State.js'

function addFeedGroup() {
  console.log("Add Group");
  // TODO - show a modal.
  let group = new FeedGroup();
  gApp.feedReader.addFeedGroup(group);
}

function deleteFeedGroup() {
  if (gApp.feedReader.selectedGroup.value) {
    gApp.feedReader.removeFeedGroup(gApp.feedReader.selectedGroup.value);  
    gApp.feedReader.selectedGroup.value = null;
  }
}

function addFeed() {
  // TODO - show modal
  let parentFeed = null;
  if (gApp.feedReader.groups.length == 0) {
    gApp.feedReader.makeDefaultGroup();
  }
  parentFeed = gApp.feedReader.groups[0];

  let feed = new Feed();
  parentFeed.addFeed(feed);
}

function deleteFeed() {
  if (gApp.feedReader.selectedFeed.value) {
    gApp.feedReader.selectedFeed.value.removeFromParent();
    gApp.feedReader.selectedFeed.value = null;
  }
}

function toggleExplodeView() {
  if (gApp.feedReader.groups.length === 0) {
    return;
  }
  let firstGroup = gApp.feedReader.groups[0];
  let isExpanded = !firstGroup.expanded;
  for (let group of gApp.feedReader.groups) {
    group.expanded = isExpanded;
    for (let feed of group.feeds) {
      feed.expanded = isExpanded;
    }
  }
}

function toggleExpandGroup(group) {
  group.expanded = !group.expanded;
}

function toggleExplodeGroup(group) {
  group.expanded = !group.expanded;
  for (let feed of group.feeds) {
    feed.expanded  = group.expanded;
  }
}

function toggleExpandFeed(feed) {
  feed.expanded = !feed.expanded;
}

function openSettings() {
  // TODO
}

</script>

<template>
  <div class="MainFeed">
    <div class="ButtonMenu">
      <button @click="addFeedGroup">Add Group</button>
      <button @click="addFeed">Add Feed</button>
      <button @click="deleteFeedGroup">Delete Group</button>
      <button @click="deleteFeed">Delete Feed</button>
      <button @click="toggleExplodeView">*</button>
      <button class="SettingsButton" @click="openSettings">Settings</button>
    </div>
    <div class="FeedGroups">
      <div v-for="feedGroup in gApp.feedReader.groups" :id="feedGroup.id" class="FeedGroup">
        <div class="GroupControls">
          <div class="GroupName">{{ feedGroup.name }}</div>
          <div class="GroupButtons">
            <button @click="toggleExpandGroup(feedGroup)">+/-</button>
            <button @click="toggleExplodeGroup(feedGroup)">*</button>
          </div>
        </div>
        <template v-if="feedGroup.expanded">
          <div v-for="feed in feedGroup.feeds" :id="feed.id" class="Feed">
            <div class="FeedControls">
              <div class="FeedName">{{ feed.name }}</div>
              <div class="FeedButtons">
                <button @click="toggleExpandFeed(feed)">+/-</button>
              </div>
            </div>
            <template v-if="feed.expanded">
              <div v-for="link in feed.links" :id="link.id" class="Link">
                <p>{{ link.name }}</p>
              </div>
            </template>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<style scoped>
.ButtonMenu {
  margin-bottom: 20px;
}

.FeedGroup {
}

.GroupName {
  margin-right: 20px;
}

.GroupControls {
  display: flex;
}

.Feed {
  padding-left: 20px;
}

.FeedName {
  margin-right: 20px;
}

.FeedControls {
  display: flex;
}

.Link {
  padding-left: 20px;
}

.SettingsButton {
  float: right;
}
</style>
