<script setup>
import { ref } from 'vue'

const userApps = ref([])

const installApp = () => {
  // TODO: Implement app installation logic
  console.log('Install app clicked')
}
</script>

<template>
  <div class="app-container">
    <div class="content">
      <h1>Sky Lizard</h1>
      
      <!-- Install App Button -->
      <button class="install-button" @click="installApp">
        Install App
      </button>
      
      <!-- User Apps List -->
      <div class="apps-section">
        <h2>Your Apps</h2>
        <div v-if="userApps.length === 0" class="empty-state">
          No apps installed yet
        </div>
        <div v-else class="apps-list">
          <!-- Apps will be listed here -->
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.app-container {
  min-height: 100vh;
  padding: 0;
  color: #fff;
  font-family: monospace;
  width: 800px;
  max-width: 800px;
  margin: 0 auto;
}

.content {
  width: 100%;
  margin: 0 auto;
  color: #000;
  padding: 40px;
}

h1 {
  font-size: 48px;
  font-weight: 900;
  text-transform: uppercase;
  margin: 0 0 40px 0;
  letter-spacing: 2px;
}

.install-button {
  width: 100%;
  padding: 20px;
  font-size: 24px;
  font-weight: 900;
  text-transform: uppercase;
  color: #fff;
  background-color: #000;
  border: 4px solid #000;
  cursor: pointer;
  margin-bottom: 40px;
  font-family: monospace;
}

.install-button:hover {
  background-color: #fff;
  color: #000;
}

.apps-section {
  border-top: 4px solid #000;
  padding-top: 40px;
}

h2 {
  font-size: 32px;
  font-weight: 900;
  text-transform: uppercase;
  margin: 0 0 20px 0;
  letter-spacing: 1px;
}

.empty-state {
  padding: 40px;
  background-color: #000;
  color: #fff;
  font-size: 18px;
  font-weight: bold;
  text-transform: uppercase;
  text-align: center;
}

.apps-list {
  /* Styles for when apps are present */
}
</style>
