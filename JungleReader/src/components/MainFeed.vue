<script setup>
import { ref, onMounted, computed } from 'vue'
import { gApp, FeedGroup, Feed } from '../State.js'
import { valOr } from '../Utils.js'
import draggable from 'vuedraggable'
import TextTreeIcon from './TextTreeIcon.vue'
import BasicModal from 'Shared/BasicModal.vue'
import GroupEditor from './GroupEditor.vue'
import FeedEditor from './FeedEditor.vue'
//import FeedItem from './FeedItem.vue'
import FeedTile from './FeedTile.vue'
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

  let parentGroup = null;
  if (optArgs.group) {
    parentGroup = optArgs.group;  
  } else {
    if (gApp.feedReader.groups.length == 0) {
      gApp.feedReader.makeDefaultGroup();
    }
    parentGroup = gApp.feedReader.groups[0];
  }

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
  parentGroup.addFeed(feed);
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
    <!--
    <div class="BackgroundImg">
      <img width="400px" height="400px" src="BigChameleon.svg" />  
    </div>
    !-->
    <div class="ButtonMenu">
      <button class="AddBtn PrimaryButton" @click="addFeed()">Add Feed</button>
      <button class="AddBtn PrimaryButton" @click="addFeedGroup()">Add Group</button>
    </div>
    <div class="FeedGroups">
      <div class="LeftPane">
        <div v-if="!gApp.isJungleExtPresent.value">
          <h3>JungleExt is not installed! Problem</h3>
        </div>
        <draggable class="GroupList" :list="gApp.feedReader.groups"
          group="groups" itemKey="id" ghostClass="DraggedChosenItem" dragClass="DraggedChosenItem">
          <template #item="{element}">
            <div class="FeedGroupItem">
              <div class="GroupControls">
                <h2 class="TextButton GroupName" :class="{Closed: !element.expanded}"
                  @click="toggleExpandGroup(element)">
                  {{ element.name ? element.name : "NoName" }}{{ element.expanded ? "" : "..." }}
                </h2>
                <div @click="(evt) => editGroup(element, evt)" class="GroupControlButton EditGroupButton TextButton">edit</div>
              </div>
              <!-- Note: we always want to render the draggable here to support dragging a feed to a collapsed group -->
              <draggable class="FeedList" :list="element.feeds" group="element.expanded"
                itemKey="id" ghostClass="DraggedChosenItem" dragClass="DraggedChosenItem"
                @change="(evt) => onDragChange(evt, element)"
                :class="{Closed: !element.expanded, OpenEmpty: element.expanded && element.isEmpty()}">
                <template #item="{ element }">
                  <template v-if="element.isVisible()">
                    <FeedTile :feed="element" @editFeed="editFeed" />
                  </template>
                </template>
                <template #footer>
                  <div v-if="element.expanded && element.isEmpty()" class="EmptyGroupIndicator">
                    <p>This group is empty. <button class="SmallButton" @click="addFeed({group: element})">Add a feed</button></p>
                  </div>
                </template>
              </draggable>
            </div>
          </template>
        </draggable>
      </div>
    </div>
  </div> 
  <BasicModal class="GroupEditorModal" ref="groupEditorModal" :showCancel="false" title="Edit Group">
    <GroupEditor :group="groupToEdit"/>
    <button class="DeleteButton SmallButton" @click="deleteGroupToEdit">Delete Group</button>
  </BasicModal>
  <BasicModal class="FeedEditorModal" ref="feedEditorModal" :showCancel="false" title="Edit Feed">
    <FeedEditor :feed="feedToEdit" />
    <button class="DeleteButton SmallButton" @click="deleteFeedToEdit">Delete Feed</button>
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
}

.LeftPane {
  overflow-y: auto;
  height: 100%;
  overflow: visible;
}

.ButtonMenu {
}

.ButtonMenu button {
  margin-right: var(--space-xs);
}

.AddBtn {
}

.GroupList {
  margin-top: var(--space-xl);
  overflow: visible;
}

.FeedGroupItem {
  margin-bottom: var(--space-m);
}

.FeedList {
  padding: var(--space-s) 0 var(--space-l) var(--space-zero);
  display: flex;
  flex-flow: row wrap;
  overflow: visible;
  gap: var(--space-m) var(--space-m);
}

.FeedList.Closed {
  padding-top: 0px;
  padding-bottom: var(--space-xxs);
}

.FeedList.OpenEmpty {
  padding-top: 0px;  
}

.GroupName {
  margin-right: var(--space-m);
  font-size: 40px;
  /* font-size: var(--h3-size); */
  /* text-overflow: ellipsis; */
}

/*
.GroupName.Closed {
  color: var(--mute-text);
}
*/

.ExpandEllipse {
  color: var(--nice-red);
}

.GroupControls {
  display: flex;
  align-items: baseline;
  flex-wrap: nowrap;
  white-space: nowrap;
}

.GroupControls .Collapse {
  font-weight: 600;
  margin-right: 8px;
  /*color: var(--nice-red);*/
}

.SettingsButton {
  float: right;
}

.OpenIndicator {
  margin-right: var(--space-s);
}

.EditGroupButton {
  min-width: 48px;
}

.GroupControlButton {
  font-weight: normal;
  text-decoration: underline;
  font-size: calc(var(--p-size));
  color: var(--secondary-text);
}

.GroupControlButton:hover, .GroupControlButton:active {
  color: var(--text-button-hover);
}

.DeleteButton {
  margin-top: var(--space-l);
}

.AddLinkedFeedInfo {
  font-family: monospace;
  font-size: var(--p-size);
}

.BackgroundImg {
  background-color: white;
  height: 600px;
}

.EmptyGroupIndicator {
  margin-top: var(--space-xs);
  font-style: italic;
}

.EmptyGroupIndicator p {
  font-size: var(--p-size);
}

.GroupEditorModal {
  /* width: 400px; */
}

.FeedEditorModal {
  width: 500px;
}

</style>
