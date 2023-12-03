<script setup>
import { ref, reactive, onMounted, computed, watch } from 'vue'
import { gApp, FeedGroup, Feed, kAppStateKey } from '../State.js'
import { valOr, downloadTextFile } from '../Utils.js'
import draggable from 'vuedraggable'
import TextTreeIcon from './TextTreeIcon.vue'
import BasicModal from 'Shared/BasicModal.vue'
import GroupEditor from './GroupEditor.vue'
import FeedEditor from './FeedEditor.vue'
import FeedTile from './FeedTile.vue'
import SetupHelp from './SetupHelp.vue'

const props = defineProps({
})

let feedCreatorModal = ref(null);
let groupCreatorModal = ref(null);
let feedEditorModal = ref(null);
let groupEditorModal = ref(null);
let addFromLinkModal = ref(null);

let dummyGroup = reactive(new FeedGroup(0));
let groupToEdit = ref(dummyGroup);

let dummyFeed = reactive(new Feed(0));
let feedToEdit = ref(dummyFeed);

let linkedFeed = ref({});

function addFeedGroup() {
  let group = FeedGroup.create();
  gApp.feedReader.addFeedGroup(group);
  groupToEdit.value = group;
  groupCreatorModal.value.showModal();
}

function deleteGroup(group) {
  gApp.feedReader.removeFeedGroup(group);
}

function deleteGroupToEdit() {
  deleteGroup(groupToEdit.value);
  groupEditorModal.value.closeModal();
  groupToEdit.value = dummyGroup;
}

function addFeed(optArgs) {
  optArgs = optArgs || {};
  let feed = gApp.feedReader.addFeed(optArgs);
  if (valOr(optArgs.editWhenDone, true)) {
    feedToEdit.value = feed;
    feedCreatorModal.value.showModal();
  }
}

function onDoneAddFeed() {
  // gApp.toast({message: 'Added feed', type: 'success'});  
}

function onDoneAddGroup() {
  // gApp.toast({message: 'Added group', type: 'success'});
}

function onCancelAddFeed() {
  // console.log("Canceled add feed");
  deleteFeed(feedToEdit.value);
  feedToEdit.value = dummyFeed;
}

function onCancelAddGroup() {
  // console.log("Canceled add group");
  deleteGroup(groupToEdit.value);  
  groupToEdit.value = dummyGroup;
}

function onClickBigReload() {
  gApp.reloadAllFeeds();
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

function deleteFeedToEdit() {
  deleteFeed(feedToEdit.value);
  feedEditorModal.value.closeModal();
  feedToEdit.value = dummyFeed;
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

function exportCurrentConfig() {
  let configStr = localStorage.getItem(kAppStateKey);
  if (!configStr) {
    return;
  }
  downloadTextFile(configStr, "JungleReaderConfig_Corrupt.txt");
}

function checkForLinkAction() {
  console.log("Checking for link action...");
  let linkAction = gApp.consumeLinkAction();
  if (linkAction) {
    if (linkAction.name == "addfeed") {
      promptAddFeedFromLink(linkAction.args);
    }
  }
}

watch(gApp.linkAction, (newVal) => {
  checkForLinkAction();
})

onMounted(() => {
  checkForLinkAction();
})

</script>

<template>
  <SetupHelp v-if="!gApp.isDoneWelcome()" />
  <div class="MainFeed">
    <!--
    <div class="BackgroundImg">
      <img width="400px" height="400px" src="BigChameleon.svg" />  
    </div>
    !-->
    <div class="ButtonMenu">
      <button class="MenuBtn PrimaryButton" @click="addFeed()">
        <vue-feather type="rss" class="Icon" />
        Add Feed
      </button>
      <button class="MenuBtn PrimaryButton" @click="addFeedGroup()">
        <vue-feather type="grid" class="Icon" />
        Add Group
      </button>
      <button class="MenuBtn PrimaryButton BigReloadBtn" @click="onClickBigReload()">
        <vue-feather type="rotate-cw" class="Icon" />
        Big Reload
      </button>
    </div>
    <div class="FeedGroups">
      <div class="LeftPane">
        <div v-if="!gApp.isJungleExtPresent.value" class="TopAlert">
          <p class="AlertText"><u>Alert</u> JungleExt is not installed. JungleReader requires the extension to work properly.
          Please install then reload the page.
          </p>
          <p><a href="https://addons.mozilla.org/en-US/firefox/addon/jungleext/" target="_blank">Install for Firefox</a></p>
          <p><a href="https://chrome.google.com/webstore/detail/jungleext/ipkgbelgehmnlfhjjedlgkpiiaicadkn" target="_blank">Install for Chrome</a></p>
        </div>
        <div v-if="gApp.failedLastLoad.value" class="FailedLastLoad">
          <p><u>Error</u> Your saved config failed to load. Please either wait for a fix, import a backup
          config, or fully reset the reader from Settings. You can export your saved config now.
          It may be able to be restored later.
          </p>
          <button class="SmallButton ExportOldConfBtn" @click="exportCurrentConfig">Export current config</button>
        </div>
        <p v-else-if="gApp.feedReader.groups.length == 0" class="NothingHereYet">Nothing here yet. Add a feed to get started.</p>
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
  <BasicModal class="GroupCreatorModal" ref="groupCreatorModal" title="Add Group"
    doneText="Save" @onCancel="onCancelAddGroup" @onDone="onDoneAddGroup">
    <GroupEditor :group="groupToEdit" />
  </BasicModal>
  <BasicModal class="FeedCreatorModal" ref="feedCreatorModal" title="Add Feed"
    doneText="Save" @onCancel="onCancelAddFeed" @onDone="onDoneAddFeed">
    <FeedEditor :feed="feedToEdit" />
  </BasicModal>
  <BasicModal class="GroupEditorModal" ref="groupEditorModal" :showCancel="false" title="Edit Group">
    <GroupEditor :group="groupToEdit"/>
    <button class="DeleteButton SmallButton" @click="deleteGroupToEdit">Delete Group</button>
  </BasicModal>
  <BasicModal class="FeedEditorModal" ref="feedEditorModal" :showCancel="false" title="Edit Feed">
    <FeedEditor :feed="feedToEdit" />
    <button class="DeleteButton SmallButton" @click="deleteFeedToEdit">Delete Feed</button>
  </BasicModal>
  <BasicModal ref="addFromLinkModal" title="Add Feed" doneText="Yes" cancelText="No" @onDone="addFeedFromLink">
    <p>Add the following feed?</p>
    <div class="AddLinkedFeedInfo CodeBlock">
      {{ addLinkedFeedDesc(linkedFeed) }}
    </div>
  </BasicModal>
</template>

<style scoped>
.MainFeed {
  position: relative;
}

.FeedGroups {
}

.LeftPane {
  overflow-y: auto;
  height: 100%;
  overflow: visible;
}

.TopAlert {
  margin-top: var(--space-s);
  padding: 16px;
  background-color: var(--dark-color);
  border-radius: 6px;
}

.TopAlert .AlertText {
  color: var(--main-text);
}

.ButtonMenu {
  display: flex;
  flex-flow: row;
}

.ButtonMenu button {
  margin-right: var(--space-xs);
}

.MenuBtn {
  display: flex;
  align-items: center;
  gap: 8px;
}

.MenuBtn .Icon {
  /*color: var(--nice-red);*/
}

.BigReloadBtn {
  margin-left: var(--space-m);
}    

.InnerReloadBtn {
  display: flex;
  align-items: center;
  gap: 4px;
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
  text-decoration: var(--brand-underline);
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

.FailedLastLoad {
  margin-top: var(--space-xl);
}

.ExportOldConfBtn {
  margin-top: var(--space-m);
}

.NothingHereYet {
  margin-top: var(--space-xl);
  font-size: var(--h4-size);
}

</style>
