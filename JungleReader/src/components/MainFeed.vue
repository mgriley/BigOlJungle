<script setup>
import { ref, onMounted, computed } from 'vue'
import { gApp, FeedGroup, Feed } from '../State.js'
import draggable from 'vuedraggable'
import TreeIcon from './TreeIcon.vue'
import BasicModal from 'Shared/BasicModal.vue'
import GroupEditor from './GroupEditor.vue'
import FeedEditor from './FeedEditor.vue'
import FeedItem from './FeedItem.vue'
import FeedViewer from './FeedViewer.vue'
import EditButton from './EditButton.vue'

let feedEditorModal = ref(null);
let groupEditorModal = ref(null);

let groupToEdit = ref(null);
let feedToEdit = ref(null);

function addFeedGroup() {
  let group = FeedGroup.create();
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

  let feed = Feed.create();
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

function onDragChange(evt, group) {
  //console.log(evt);
  if (evt.added) {
    let feed = evt.added.element;
    //console.log("Elem changing group: " + feed.parentGroup.name + " -> " + group.name);
    feed.fixupAfterDrag(group);
    // If not already expanded, expand so that can see new feed.
    group.expanded = true;
  }
}

/*
function onAddDraggedFeed(evt, group) {
  console.log("On Added feed");

  let feed = evt.draggedContext.element;
  console.log("Feed: " + feed);
  //feed.fixupAfterDrag(group);
}

function onRemoveDraggedFeed(evt) {
  //console.log("On Removed feed");
}
*/

function openSettings() {
  // TODO
}

</script>

<template>
  <div class="MainFeed">
    <div v-if="!gApp.isJungleExtPresent.value">
      <h3>JungleExt is not installed! Problem</h3>
    </div>
    <div class="ButtonMenu">
      <button @click="addFeedGroup">Add Group</button>
      <button @click="addFeed">Add Feed</button>
      <button @click="deleteSelectedFeedGroup">Delete Group</button>
      <button @click="deleteSelectedFeed">Delete Feed</button>
      <button @click="toggleExplodeView">*</button>
      <!--<button class="SettingsButton" @click="openSettings">Settings</button>-->
    </div>
    <div class="FeedGroups">
      <div class="LeftPane">
        <draggable class="FeedGroup" :list="gApp.feedReader.groups"
          group="groups" itemKey="id" ghostClass="DraggedChosenItem" dragClass="DraggedChosenItem">
          <template #item="{element}">
            <div class="FeedGroupItem">
              <div class="GroupControls">
                <TreeIcon :expanded="element.expanded" @click="toggleExpandGroup(element)" />
                <div class="GroupName TextButton" @click="toggleExpandGroup(element)">{{ element.name }}</div>
                <div class="GroupButtons">
                  <EditButton @click="(evt) => editGroup(element, evt)" />
                </div>
              </div>
              <!-- Note: we always want to render the draggable here to support dragging a feed to a collapsed group -->
              <draggable class="FeedGroup" :list="element.feeds" group="element.expanded"
                itemKey="id" ghostClass="DraggedChosenItem" dragClass="DraggedChosenItem"
                @change="(evt) => onDragChange(evt, element)">
                <template #item="{ element }">
                  <template v-if="element.isVisible()">
                    <FeedItem class="FeedGroupElem" :feed="element" @editFeed="editFeed" />
                  </template>
                </template>
              </draggable>
            </div>
          </template>
        </draggable>
      </div>
      <div class="RightPane">
        <FeedViewer v-if="gApp.feedReader.getSelectedFeed()" :feed="gApp.feedReader.getSelectedFeed()" />
      </div>
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
.FeedGroups {
  display: grid;
  grid-template-columns: 1fr 2fr;
  grid-template-areas: "left right";
}

.FeedGroupElem {
}

.LeftPane {
  grid-area: left;
  overflow-y: auto;
  height: 100%;
}

.RightPane {
  grid-area: right;
  padding-left: 40px;
  overflow-y: auto;
  height: 100%;
}

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
  flex-wrap: nowrap;
  white-space: nowrap;
}

.SettingsButton {
  float: right;
}
</style>
