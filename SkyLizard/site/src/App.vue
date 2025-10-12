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
      <h1>App Manager</h1>
      
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
  display: flex;
  justify-content: center;
  padding: 2rem 1rem;
  background-color: #f5f5f5;
}

.content {
  width: 100%;
  max-width: 800px;
  background: white;
  border-radius: 8px;
  padding: 2rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

h1 {
  text-align: center;
  color: #333;
  margin-bottom: 2rem;
  font-size: 2.5rem;
}

.install-button {
  width: 100%;
  padding: 1rem 2rem;
  font-size: 1.25rem;
  font-weight: bold;
  color: white;
  background-color: #007bff;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.2s;
  margin-bottom: 3rem;
}

.install-button:hover {
  background-color: #0056b3;
}

.install-button:active {
  transform: translateY(1px);
}

.apps-section {
  border-top: 1px solid #eee;
  padding-top: 2rem;
}

h2 {
  color: #333;
  margin-bottom: 1rem;
  font-size: 1.5rem;
}

.empty-state {
  text-align: center;
  color: #666;
  font-style: italic;
  padding: 2rem;
  background-color: #f8f9fa;
  border-radius: 4px;
}

.apps-list {
  /* Styles for when apps are present */
}
</style>
