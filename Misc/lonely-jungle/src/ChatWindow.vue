<script setup>
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
import { gApp, } from './State.js'
import PostsList from './PostsList.vue'
import TextInput from './TextInput.vue'

const props = defineProps({
  page: Object,
})

let chatBody = ref(null);

let chatState = computed(() => {
  return gApp.getUser().chat;
})

/*
function onKeyPress(evt) {
  console.log("Handling key press");
  if (evt.code == 'Enter') {
    chatState.value.selectedChat.sendMessage();
    return false;
  }
  return true;
}
*/

function sendMessage() {
  chatState.value.selectedChat.sendMessage()
  // Scroll to bottom of chat
  // TODO - get this working
  /*
  chatBody.value.scroll({
    top: chatBody.value.scrollHeight,
    behavior: 'smooth'
  });
  */
}

</script>

<template>
  <div>
    <h1>Chat</h1>
    <div class="Main">
      <div class="Sidebar">
        <div v-for="chat in chatState.chats">
          <button @click="chatState.openChat(chat.username)">{{ chat.username }}</button>
        </div>
      </div>
      <div class="Body" ref="chatBody">
        <div v-if="chatState.selectedChat">
          <div class="Messages">
            <p>Chat with {{chatState.selectedChat.username}}:</p>
            <div v-for="msg in chatState.selectedChat.messages" class="Message" :class="{IsMe: msg.isMe}">
              <p class="MessageElem">{{ msg.body }}</p>
            </div>
          </div>
          <div class="TextEntry">
            <textarea class="Block EntryBox" v-model="chatState.selectedChat.nextMessage"
              @keyup.enter.exact="sendMessage">
            </textarea>
            <button class="SendBtn" @click="sendMessage">Send</button>
          </div>
        </div>
        <div v-else>
          <p>Nothing here yet.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.Main {
  display: flex;
  flex-flow: row nowrap;
  border: 1px solid black;
  max-width: 400px;
  height: 600px;
}

.Sidebar {
  padding: var(--space-xs);
  border-right: 1px solid black;
  width: 40%;
}

.Body {
  padding: var(--space-xs);
  width: 100%;
  overflow-y: scroll;
}

.Messages {
  display: flex;
  flex-flow: column nowrap;
}

.Message {
  padding: var(--space-xxs);
  border: 1px solid black;
  margin-bottom: var(--space-xxs);
  align-self: start;
  max-width: 80%;
}

.Message.IsMe {
  align-self: end;
  background-color: coral;
}

.MessageElem {
  white-space: pre-wrap;
}

.TextEntry {
  margin-top: var(--space-s);
  width: 100%;
  display: flex;
  flex-flow: column nowrap;
}

.EntryBox {
  resize: none;
  width: 100%;
}

.SendBtn {
  align-self: end;
}
</style>
