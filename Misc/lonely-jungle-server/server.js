const express = require('express');
const { ExpressPeerServer } = require("peer");
const app = express();

app.enable("trust proxy");

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

// Listen to the App Engine-specified port, or 8090 otherwise.
// Note: avoid 8080 on mac.
const PORT = process.env.PORT || 8090;
const server = app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}...`);
});

const peerServer = ExpressPeerServer(server, {
  // TODO - turn off for prod?
  debug: true,
});

app.use("/peerjs", peerServer);

peerServer.on("connection", (client) => {
  console.log(`Client ${client.id} connected`, client);
  // TODO - validate the client token here
  if (client.token !== "mypassword") {
    console.log("Invalid password. Disconnecting.")
    client.socket.close();
  }
  console.log("Password valid");
});

