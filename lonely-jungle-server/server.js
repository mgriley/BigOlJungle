const express = require('express');
const app = express();

let users = [
  {
    username: "user-a",
  },
  {
    username: "user-b",
  },
  {
    username: "user-c",
  }
]

async function getUser() {
}

async function getUsers() {
  return users;
}

app.get('/', (req, res) => {
  res.send('Hello from App Engine!');
});

app.get("/search", async (req, res) => {
  let users = await getUsers();
  res.json({users: users})
});

// Listen to the App Engine-specified port, or 8080 otherwise
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}...`);
});

