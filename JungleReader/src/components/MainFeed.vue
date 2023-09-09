<script setup>
import { ref, onMounted, computed } from 'vue'
import { gApp, FeedGroup, Feed } from '../State.js'
import { valOr } from '../Utils.js'
import draggable from 'vuedraggable'
import TextTreeIcon from './TextTreeIcon.vue'
import BasicModal from 'Shared/BasicModal.vue'
import GroupEditor from './GroupEditor.vue'
import FeedEditor from './FeedEditor.vue'
import FeedItem from './FeedItem.vue'
import EditButton from './EditButton.vue'
import SetupHelp from './SetupHelp.vue'

const props = defineProps({
})

let feedEditorModal = ref(null);
let groupEditorModal = ref(null);
let addFromLinkModal = ref(null);

let groupToEdit = ref(null);
let feedToEdit = ref(null);

let linkedFeed = ref({});

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

function addFeed(optArgs) {
  optArgs = optArgs || {};
  let parentFeed = null;
  if (gApp.feedReader.groups.length == 0) {
    gApp.feedReader.makeDefaultGroup();
  }
  parentFeed = gApp.feedReader.groups[0];

  let feed = Feed.create();
  if (optArgs.name) {
    feed.name = optArgs.name;
  }
  if (optArgs.type) {
    feed.type = optArgs.type;
  }
  if (optArgs.url) {
    feed.url = optArgs.url;
  }
  parentFeed.addFeed(feed);
  if (valOr(optArgs.editWhenDone, true)) {
    editFeed(feed);
  }
}

function promptAddFeedFromLink(query) {
  linkedFeed.value = query;
  addFromLinkModal.value.showModal();
}

function addFeedFromLink() {
  let args = {
    ...linkedFeed.value,
    editWhenDone: false
  };
  addFeed(args);
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

function addLinkedFeedDesc(args) {
  return `Name: ${args.name}
Type: ${args.type}
URL:  ${args.url}
`
}

onMounted(() => {
  let linkAction = gApp.consumeLinkAction();
  if (linkAction) {
    if (linkAction.name == "addfeed") {
      promptAddFeedFromLink(linkAction.args);
    }
  }
})

</script>

<template>
  <SetupHelp v-if="!gApp.isDoneWelcome()" />
  <div class="MainFeed">
    <button class="SaveButton" @click="gApp.saveAll()">Save Changes</button>
    <div class="ButtonMenu">
      <button @click="addFeed()">Add Feed</button>
      <button @click="addFeedGroup()">Add Group</button>
    </div>
    <div class="FeedGroups">
      <div class="LeftPane">
        <div v-if="!gApp.isJungleExtPresent.value">
          <h3>JungleExt is not installed! Problem</h3>
        </div>
        <draggable class="FeedGroup" :list="gApp.feedReader.groups"
          group="groups" itemKey="id" ghostClass="DraggedChosenItem" dragClass="DraggedChosenItem">
          <template #item="{element}">
            <div class="FeedGroupItem">
              <div class="GroupControls">
                <TextTreeIcon class="GroupName Collapse" :expanded="element.expanded" @click="toggleExpandGroup(element)" />
                <div class="GroupName TextButton" @click="toggleExpandGroup(element)">{{ element.name }}</div>
                <div @click="(evt) => editGroup(element, evt)" class="EditButton TextButton">edit</div>
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
    </div>
  </div> 
  <BasicModal ref="groupEditorModal" :showCancel="false" title="Edit Group">
    <GroupEditor :group="groupToEdit"/>
    <button class="DeleteButton" @click="deleteGroupToEdit">Delete Group</button>
  </BasicModal>
  <BasicModal ref="feedEditorModal" :showCancel="false" title="Edit Feed">
    <FeedEditor :feed="feedToEdit" />
    <button class="DeleteButton DeleteFeedButton" @click="deleteFeedToEdit">Delete Feed</button>
  </BasicModal>
  <BasicModal ref="addFromLinkModal" title="Add Feed" doneText="Yes" cancelText="No" @onDone="addFeedFromLink">
    <p><b>Add the following feed?</b></p>
    <div class="AddLinkedFeedInfo CodeBlock">
      {{ addLinkedFeedDesc(linkedFeed) }}
    </div>
  </BasicModal>
</template>

<style scoped>
.MainFeed {
  position: relative;
}

.SaveButton {
  float: right;
}

.FeedGroups {
  display: grid;
  grid-template-columns: 1fr;
  grid-template-areas: "left";
}

.FeedGroupElem {
}

.LeftPane {
  grid-area: left;
  overflow-y: auto;
  height: 100%;
}

.ButtonMenu {
  margin-bottom: 20px;
}

.ButtonMenu button {
  margin-right: 4px;
}

.FeedGroup {
  margin: 10px 0px 40px 0px;
}

.GroupName {
  margin-right: 20px;
  font-size: 2rem;
  font-weight: 800;
  letter-spacing: -1px;
  /* text-overflow: ellipsis; */
}

.GroupControls {
  display: flex;
  align-items: baseline;
  flex-wrap: nowrap;
  white-space: nowrap;
}

.GroupControls .Collapse {
  font-weight: 600;
  margin-right: 10px;
  /*color: var(--nice-red);*/
}

.SettingsButton {
  float: right;
}

.EditButton {
  margin-left: 20px;
  color: var(--very-mute-text);
  font-weight: normal;
}

.DeleteButton {
  margin-top: 20px;
}

.DeleteFeedButton {
  margin-top: 30px;
}

.AddLinkedFeedInfo {
  font-family: monospace;
  font-size: 1rem;
}

</style>
