<script setup>
import { ref, onMounted, computed } from 'vue'
import { gApp, FeedGroup, Feed } from '../State.js'
import draggable from 'vuedraggable'
import BasicModal from 'Shared/BasicModal.vue'
import GroupEditor from './GroupEditor.vue'
import FeedEditor from './FeedEditor.vue'
import FeedItem from './FeedItem.vue'

let feedEditorModal = ref(null);
let groupEditorModal = ref(null);

let groupToEdit = ref(null);
let feedToEdit = ref(null);

function addFeedGroup() {
  let group = new FeedGroup();
  gApp.feedReader.addFeedGroup(group);
  editGroup(group);
}

function deleteGroup(group) {
  gApp.feedReader.removeFeedGroup(group);
}

function deleteSelectedFeedGroup() {
  let selectedItem = gApp.feedReader.getSelectedItem();
  if (selectedItem instanceof FeedGroup) {
    deleteFeedGroup(selectedItem);
    gApp.feedReader.setSelectedItem(null);
  }
}

function deleteGroupToEdit() {
  deleteGroup(groupToEdit.value);
  groupEditorModal.value.closeModal();
}

function addFeed() {
  let parentFeed = null;
  if (gApp.feedReader.groups.length == 0) {
    gApp.feedReader.makeDefaultGroup();
  }
  parentFeed = gApp.feedReader.groups[0];

  let feed = new Feed();
  parentFeed.addFeed(feed);
  editFeed(feed);
}

function deleteFeed(feed) {
  feed.removeFromParent();
}

function deleteSelectedFeed() {
  let selectedItem = gApp.feedReader.getSelectedItem();
  if (selectedItem instanceof Feed) {
    deleteFeed(selectedItem);
    gApp.feedReader.setSelectedItem(selectedItem);
  }
}

function deleteFeedToEdit() {
  deleteFeed(feedToEdit.value);
  feedEditorModal.value.closeModal();
}

function selectGroup(group) {
  gApp.feedReader.setSelectedItem(group);
}

function editGroup(group, clickEvt) {
  groupToEdit.value = group;
  groupEditorModal.value.showModal(clickEvt);
}

function editFeed(feed, clickEvt) {
  feedToEdit.value = feed;
  feedEditorModal.value.showModal(clickEvt);
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

function openSettings() {
  // TODO
}

</script>

<template>
  <div class="MainFeed">
    <div class="ButtonMenu">
      <button @click="addFeedGroup">Add Group</button>
      <button @click="addFeed">Add Feed</button>
      <button @click="deleteSelectedFeedGroup">Delete Group</button>
      <button @click="deleteSelectedFeed">Delete Feed</button>
      <button @click="toggleExplodeView">*</button>
      <!--<button class="SettingsButton" @click="openSettings">Settings</button>-->
    </div>
    <div class="FeedGroups">
      <draggable class="FeedGroup" :list="gApp.feedReader.groups" group="groups" itemKey="id">
        <template #item="{element}">
          <div class="FeedGroupItem">
            <div class="GroupControls">
              <div class="GroupName TextButton" @click="toggleExpandGroup(element)">{{ element.name }}</div>
              <div class="GroupButtons">
                <button @click="toggleExpandGroup(element)">+/-</button>
                <button @click="toggleExplodeGroup(element)">*</button>
                <button @click="(evt) => editGroup(element, evt)">Edit</button>
                <button @click="selectGroup(element)">Select</button>
              </div>
            </div>
            <template v-if="element.expanded">
              <draggable class="FeedGroup" :list="element.feeds" group="feeds" itemKey="id">
                <template #item="{ element }">
                  <FeedItem :feed="element" @editFeed="editFeed" />
                </template>
              </draggable>
            </template>
          </div>
        </template>
      </draggable>
    </div>
  </div>
  <BasicModal ref="groupEditorModal" :showCancel="false">
    <GroupEditor :group="groupToEdit"/>
    <button class="DeleteButton" @click="deleteGroupToEdit">Delete</button>
  </BasicModal>
  <BasicModal ref="feedEditorModal" :showCancel="false">
    <FeedEditor :feed="feedToEdit" />
    <button class="DeleteButton" @click="deleteFeedToEdit">Delete</button>
  </BasicModal>
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

.SettingsButton {
  float: right;
}
</style>
