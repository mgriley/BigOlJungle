<script setup>
import { ref, reactive, onMounted, computed, watch } from 'vue'
import { gApp, FeedGroup, Feed, kAppStateKey } from '../State.js'
import { valOr, downloadTextFile } from '../Utils.js'
import draggable from 'vuedraggable'
import BasicModal from 'Shared/BasicModal.vue'
import GroupEditor from './GroupEditor.vue'
import FeedEditor from './FeedEditor.vue'
import AddFeedWidget from './AddFeedWidget.vue'
import FeedTile from './FeedTile.vue'
import DeleteButton from './DeleteButton.vue'

const props = defineProps({
})

let feedCreatorModal = ref(null);
let addFeedWidget = ref(null);
let groupCreatorModal = ref(null);
let feedEditorModal = ref(null);
let groupEditorModal = ref(null);
let addFromLinkModal = ref(null);

let dummyGroup = reactive(new FeedGroup(0));
let groupToEdit = ref(dummyGroup);

let dummyFeed = reactive(new Feed(0));
let feedToEdit = ref(dummyFeed);

let linkedFeed = ref({});

let feedTypeIcons = [
  {
    name: 'RSS',
    icon: 'bi-rss',
  },
  {
    name: 'YouTube',
    icon: 'bi-youtube',
  },
  {
    name: 'Mastodon',
    icon: 'bi-mastodon',
  },
  {
    name: 'Reddit',
    icon: 'bi-reddit',
  },
  {
    name: 'Blogs',
    icon: 'bi-globe'
  },
  {
    name: 'Plugins',
    icon: 'bi-plugin',
  },
]

function addFeedGroup() {
  let group = gApp.feedReader.addGroup({});
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

function addHelpFeed(args) {
  gApp.feedReader.addFeed(args);
  // gApp.toast({message: 'Added!', type: 'success'});  
}

function startAddFeed(optArgs) {
  addFeedWidget.value.reset();
  feedCreatorModal.value.showModal();
}

function onDoneAddFeed() {
  // gApp.toast({message: 'Added feed', type: 'success'});  
}

function onDoneAddGroup() {
  // gApp.toast({message: 'Added group', type: 'success'});
}

function onCancelAddFeed() {
  // console.log("Canceled add feed");
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
  };
  gApp.feedReader.addFeed(args);
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

function onDoneSetup() {
  // Add beginner feeds
  addHelpFeed({name: 'CreatingGames', type: 'YouTube', url: 'https://www.youtube.com/sora_sakurai_en'})
  addHelpFeed({name: 'XKCD Bot', type: 'Mastodon', url: 'https://mastodon.xyz/@xkcd'})
  addHelpFeed({name: 'r/AskHistorians', type: 'Reddit', url: 'https://www.reddit.com/r/askhistorians'})

  gApp.setDoneFeedSetup(true);
  gApp.toast({message: 'Setup complete!', type: 'success'});  
}

function hasCoarseTouch() {
  // Mobile devices have coarse touch, typically
  return Boolean(window.matchMedia("(pointer: coarse)").matches);
}

let draggableDisabled = computed(() => {
  // console.log("Has coarse touch: " + hasCoarseTouch());
  return hasCoarseTouch();
})

function goToExplore() {
  gApp.router.replace({path: "/explore"})  
}

watch(gApp.linkAction, (newVal) => {
  checkForLinkAction();
})

onMounted(() => {
  checkForLinkAction();
})

</script>

<template>
  <div class="MainFeed">
    <div v-if="!gApp.isDoneFeedSetup()" class="HelpText AlertPane">
      <h1 class="PageHeader MarginBotXXS">Welcome!</h1>
      <p class="IntroHelp MarginBotXS">
        JungleReader is a <b>free</b> and <b>open-source</b> feed reader. Read what you like, and $%^* the rest.
      </p>
      <div class="MarginBotXS">
        <h4 class="MarginBotXXS">Supports</h4>
        <div class="SupportedTypes">
          <div v-for="item in feedTypeIcons" class="SupportItem">
            <!--
            <div class="SupportIconDiv">
              <i :class="item.icon" class="SupportIcon"></i>
            </div>
            -->
            <p class="SupportText">{{item.name}}</p>
          </div>
        </div>
      </div>
      <div class="FeaturesDiv MarginBotS">
        <h4 class="MarginBotXXS">Features</h4>
        <div class="FeatureItems">
          <div class="FeatureItem">
            <!--
            <div>
              <i class="bi-display FeatureIcon"></i>
              <i class="bi-phone FeatureIcon"></i>
            </div>
            -->
            <p class="FeatureText">
              Desktop & mobile webapp
            </p>
          </div>
          <div class="FeatureItem">
            <!--
            <div>
              <i class="bi-arrow-repeat FeatureIcon"></i>
            </div>
            -->
            <p class="FeatureText">Device sync (coming soon)</p>
          </div>
          <div class="FeatureItem">
            <p class="FeatureText">Native apps (coming soon)</p>
          </div>
        </div>
      </div>
      <button class="DoneBtn" @click="onDoneSetup()">Got it!</button>
    </div>
    <div v-else class="MainArea">
      <div class="ButtonMenu MarginBotXS">
        <button class="MenuBtn" @click="startAddFeed()">
          <vue-feather type="rss" class="Icon" />
          Add Feed
        </button>
        <button class="MenuBtn" @click="addFeedGroup()">
          <vue-feather type="grid" class="Icon" />
          Add Group
        </button>
        <button class="MenuBtn BigReloadBtn" @click="onClickBigReload()">
          <vue-feather type="rotate-cw" class="Icon" />
          Reload
        </button>
        <!--
        <button class="MenuBtn" @click="goToExplore()">
          <vue-feather type="compass" class="IconB" />
          Explore
        </button>
        -->
        <button class="ExploreBtnCommon MenuBtn ExploreBtnDesktop DesktopOnly" @click="goToExplore()">
          <vue-feather type="zap" class="" />
          Explore
        </button>
      </div>
      <div class="ExploreDiv">
        <button class="ExploreBtnCommon ExploreBtnMobile MobileOnly" @click="goToExplore()">
          <vue-feather type="zap" class="" />
          Explore
        </button>
      </div>
      <div class="FeedGroups">
        <div class="LeftPane">
          <div v-if="gApp.isJungleExtMissing()" class="TopAlert AlertPane">
            <p class="AlertText"><u>Alert</u> You are using the JungleExt fetch method but JungleExt is not installed.
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
          <draggable class="GroupList" :list="gApp.feedReader.groups"
            group="groups" itemKey="id" ghostClass="DraggedChosenItem" dragClass="DraggedChosenItem"
            :disabled="draggableDisabled"
          >
            <template #item="{element}">
              <div class="FeedGroupItem">
                <div class="GroupControls">
                  <h2 class="TextButton GroupName PlainHeader" :class="{Closed: !element.expanded}"
                    @click="toggleExpandGroup(element)">
                    {{ element.name ? element.name : "NoName" }}{{ element.expanded ? "" : "..." }}
                  </h2>
                  <div @click="(evt) => editGroup(element, evt)" class="GroupControlButton TextButton">
                    <vue-feather type="settings" class="Icon" size="22px" />
                  </div>
                </div>
                <!-- Note: we always want to render the draggable here to support dragging a feed to a collapsed group -->
                <draggable class="FeedList" :list="element.feeds" group="element.expanded"
                  itemKey="id" ghostClass="DraggedChosenItem" dragClass="DraggedChosenItem"
                  @change="(evt) => onDragChange(evt, element)"
                  :class="{Closed: !element.expanded, OpenEmpty: element.expanded && element.isEmpty()}"
                  :disabled="draggableDisabled"
                >
                  <template #item="{ element }">
                    <template v-if="element.isVisible()">
                      <FeedTile :feed="element" @editFeed="editFeed" />
                    </template>
                  </template>
                  <template #footer>
                    <div v-if="element.expanded && element.isEmpty()" class="EmptyGroupIndicator">
                      <p>This group is empty. <button class="SmallButton" @click="startAddFeed({group: element})">Add a feed</button></p>
                    </div>
                  </template>
                </draggable>
              </div>
            </template>
          </draggable>
        </div>
      </div>
    </div>
  </div> 
  <BasicModal class="GroupCreatorModal" ref="groupCreatorModal" title="Add Group"
    doneText="Save" @onCancel="onCancelAddGroup" @onDone="onDoneAddGroup">
    <GroupEditor :group="groupToEdit" />
  </BasicModal>
  <BasicModal class="FeedCreatorModal" ref="feedCreatorModal" title="Add Feed"
    :showDone="false" @onCancel="onCancelAddFeed" @onDone="onDoneAddFeed">
    <AddFeedWidget ref="addFeedWidget" @onDone="feedCreatorModal.closeModal()"/>
  </BasicModal>
  <BasicModal class="GroupEditorModal" ref="groupEditorModal" :showCancel="false" title="Edit Group">
    <GroupEditor :group="groupToEdit"/>
    <DeleteButton class="DeleteButton" @click="deleteGroupToEdit"/>
  </BasicModal>
  <BasicModal class="FeedEditorModal" ref="feedEditorModal" :showCancel="false" title="Edit Feed">
    <FeedEditor :feed="feedToEdit" />
    <DeleteButton class="DeleteButton" @click="deleteFeedToEdit"/>
  </BasicModal>
  <BasicModal ref="addFromLinkModal" title="Add Feed" cancelText="No" @onDone="addFeedFromLink">
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
}

.TopAlert .AlertText {
  color: var(--main-text);
}

.ButtonMenu {
  display: flex;
  flex-flow: row;
}

.MenuBtn {
  display: flex;
  align-items: center;
  gap: 8px;

  text-transform: uppercase;
  border: none;
  padding: 4px;
  margin-right: var(--space-xs);
}

.ExploreDiv {
}

.ExploreBtnCommon {
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  justify-content: center;
  gap: var(--space-xxs);

  /* text-align: left; */
  background-color: var(--brand-color-yellow);
  /* filter: invert(1); */
  border-radius: var(--border-radius-large);
  /* background-color: lightgrey; */
  border: none;
  color: var(--main-bg);
  font-size: var(--small-size);
}

.ExploreBtnDesktop {
  margin-left: var(--space-s);
  width: 120px;
  text-transform: none;
}

.ExploreBtnMobile {
  padding: var(--space-s);
  margin-top: 8px;
  max-width: 400px;
  width: 100%;
  margin: auto;
}

.InnerReloadBtn {
  display: flex;
  align-items: center;
  gap: 4px;
}

.GroupList {
  margin-top: var(--space-l);
  overflow: visible;
}

.FeedGroupItem {
  margin-bottom: var(--space-m);
}

.FeedList {
  padding: var(--space-xs) 0 var(--space-l) var(--space-zero);
  display: flex;
  flex-flow: row wrap;
  overflow: visible;
  /* gap: var(--space-m) var(--space-m); */
  gap: var(--space-s) var(--space-s);
}

.FeedList.Closed {
  padding-top: 0px;
  padding-bottom: var(--space-xxs);
}

.FeedList.OpenEmpty {
  padding-top: 0px;  
}

.GroupName {
  margin-right: var(--space-s);
  font-size: var(--h3-size);
}

.GroupControls {
  display: flex;
  align-items: center;
  flex-wrap: nowrap;
  white-space: nowrap;
}

.GroupControls .Collapse {
  font-weight: 600;
  margin-right: 8px;
}

.SettingsButton {
  float: right;
}

.OpenIndicator {
  margin-right: var(--space-s);
}

.GroupControlButton {
  font-weight: normal;
  text-decoration: underline;
  font-size: var(--p-size);
  color: var(--mute-text);
}

@media (hover: hover) {
  .GroupControlButton:hover {
    color: var(--text-button-hover);
  }
}

.GroupControlButton:active {
  color: var(--text-button-hover);
}

.DeleteButton {
  margin-top: var(--space-m);
}

.AddLinkedFeedInfo {
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

.HelpText {
  margin-bottom: var(--space-m);
  //border-color: var(--brand-color-yellow);
  border-color: var(--brand-color-yellow);
  background-color: var(--main-bg);
}

.HelpText p {
  color: var(--main-text);
}

.SampleFeeds {
  margin-bottom: 16px;
}

.FromHereList {
  margin-bottom: 16px;
}

.IntroHelp {
  font-size: var(--small-size);
}

@media (max-width: 768px) {
  .ButtonMenu {
    /* flex-flow: column nowrap; */
    gap: var(--space-xxs);
    justify-content: space-between;
    /* margin-right: var(--space-xs); */
  }

  .MenuBtn {
    font-size: var(--extra-small);
    text-align: left;
    gap: var(--space-xs);
    /* align-items: start; */
    min-width: 0; 

    width: 120px;

    flex-flow: column;
    /* border: 1px solid var(--brand-color-yellow); */
    /* padding: var(--space-xs); */
  }

  .MenuBtn .Icon {
    /* display: none; */
  }

  .GroupName {
    font-size: 28px;
  }

  .GroupList {
    margin-top: var(--space-m);
  }

  .EditGroupButton {
    font-size: var(--p-size);
  }

  .FeedList {
  }
}

.SupportedTypes {
  max-width: 100%;
  display: flex;
  flex-flow: row wrap;
  gap: var(--space-xs) var(--space-m);
  /* justify-content: space-between; */
}

.SupportItem {
  max-width: 70px;
  display: flex;
  flex-flow: column nowrap;
  align-items: center;
}

.SupportIconDiv {
}

.SupportIcon {
  font-size: var(--h2-size);
}

.SupportText {
  font-size: var(--smaller-size);
  /* padding: var(--space-xs); */
  /* width: 80px; */
  /* background-color: var(--light-color); */
  text-align: center;
}

.FeatureItems {
  display: flex;
  flex-flow: row nowrap;
  gap: var(--space-xs) var(--space-s);
}

.FeatureItem {
  max-width: 140px;
  margin-bottom: var(--space-xxs);
}

.FeatureIcon {
  font-size: var(--h2-size);
  /* color: var(--brand-color-yellow); */
}

.FeatureText {
  font-size: var(--smaller-size);
  text-align: center;
}

.IconB {
  color: purple;
}

.MobileOnly {
  display: none;
}

.DesktopOnly {
}

@media (max-width: 768px) {
  .MobileOnly {
    display: flex;
  }

  .DesktopOnly {
    display: none;
  }
}

</style>
