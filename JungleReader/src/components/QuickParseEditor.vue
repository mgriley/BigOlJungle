<script setup>
import { ref, onMounted, computed } from 'vue'
import { gApp, FeedGroup, Feed, getTimeAgoStr } from '../State.js'
import QuickParseNode from './QuickParseNode.vue'

/*
Format:

General plugin info.
- Plugin Name
- Enabled/disabled
- Options

Test URL.
Big HTML viewer/editor. (Tree view where can click elems)
Click elems to set the right content.
To click:
- Item title
- Item url
- Item pts / extra info
- Item date
*/

const props = defineProps(['plugin'])

let showTutorial = ref(false);

function toggleTutorial() {
  showTutorial.value = !showTutorial.value;
}

</script>

<template>
  <div class="QuickParseEditor">
    <div class="Tutorial">
      <button @click="toggleTutorial">Tutorial</button>
      <div v-if="showTutorial">
        <p>
        Tutorial: Use the QuickParser to teach JungleReader how to read websites of a certain type, such as reddit feeds.
        You'll have to help by annotating the HTML page. Here's how:
        </p>
        <ul>
          <li>
          Step 1: Enter the URL of the website you'd like to read and press "Fetch".
          </li>
          <li>
          Step 2: You should see the page's raw HTML show up. Search through the HTML until you find the text of the items you'd
          like to read. For example, if the website shows a list of posts, first the HTML for the first post in the list.
          </li>
          <li>
          Step 3: See the list of colored items? You'll need to fill in the required ones. Click an HTML element in the HTML viewer,
          then set which item it is.
          </li>
          <li>
          Step 4: Once you have set the items, click "Run Test Parse". If you have set things up correctly, you should see the
          website's posts printed properly. Any missing items will be pointed out. If it's working, you're all done. You can use
          the custom feed name from your feeds page.
          </li>
        </ul>

        <p>
        Also Note: if the website you're reading has a complex structure, the QuickParser might not work on it. In that case, you may be
        able to use a "Text" type CustomPlugin to write a parser program. If the website changes its HTML, your feeds will show errors and
        you'll have to come back here to update the annotations.
        </p>
      </div>
    </div>
    <p>Test URL</p>
    <input v-model="plugin.quickParser.testUrl" class="Block UrlInput" placeholder="Ex. https://news.ycombinator.com" size="40">
    <button @click="plugin.quickParser.fetchTestContent()">Fetch Test Page</button>
    <div class="DomTree">
      <template v-if="plugin.quickParser.testFetchContent !== null">
        <QuickParseNode :nodeData="plugin.quickParser.testFetchContent" :childNum="0" :numChildren="1" />
      </template>
      <template v-else>
      </template>
    </div>
    <div>
      <button @click="plugin.quickParser.runTestParse()">Run Test Parse</button>
      <div v-if="plugin.quickParser.testParseOutput !== null">
        <p>{{ plugin.quickParser.testParseOutput }}</p>
      </div>
    </div>
  </div>
</template>

<style scoped>

.DomTree {
  margin-top: 40px;
  margin-bottom: 40px;
}

.Tutorial {
  margin-bottom: 40px;
}
</style>
