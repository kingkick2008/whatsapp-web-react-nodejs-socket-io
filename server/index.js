
const express = require("express");
const app = express();
const { Client, LocalAuth } = require("whatsapp-web.js");
const port = 4000;
const cors = require("cors");
app.use(cors());
const server = require("http").createServer(app);

const { Server } = require("socket.io");

const io = new Server(server, {
  cors: {
    origin: ["http://localhost:3000", "http://localhost:4200"],
    methods: ["GET", "POST"],
  },
});


app.get("/", (req, res) => {
  res.send("Hello word");
});

server.listen(port, () => {
  console.log(`Server started on port ${port}`);
});
const allSessionObject = {};
const createWhatsappSession = (id, socket) => {
  const client = new Client({
    puppeteer: {
      headless: true,
    },
    authStrategy: new LocalAuth({
      clientId: id,
    }),
    webVersionCache: {
      type: "remote",
      remotePath:
        "https://raw.githubusercontent.com/wppconnect-team/wa-version/main/html/2.2412.54.html",
    },
  });

  client.on("qr", (qr) => {
    // Generate and scan this code with your phone
    console.log("QR RECEIVED", qr);
    socket.emit("qr", { qr });
  });
  client.on("authenticated", () => {
    console.log("authenticated");
  });
  client.on("ready", () => {
    console.log("Client is ready!");
    allSessionObject[id] = client;
    socket.emit("ready", {
      id,
      message: "Client is ready",
    });
  });
  client.initialize();
};

io.on("connection", (socket) => {
  console.log("user connect", socket?.id);

  socket.on("connected", (data) => {
    console.log("server receive ", data);
    socket.emit("hello", "Hollo from server");
  });

  socket.on("disconnect", () => {
    console.log("user disconnect");
  });

  socket.on("createSession", (data) => {
    console.log(data);
    const { id } = data;
    createWhatsappSession(id, socket);
  });

  socket.on("getAllChats", async (data) => {
    console.log("getAllChats", data);
    const { id } = data;
    const client = allSessionObject[id];
    const allChats = await client.getChats();
    socket.emit("allChats", {allChats});
  });

  socket.on("sendMessage", async (data) => {
    console.log("sendMessage", data);
    const { id, to, message } = data;
    const client = allSessionObject[id];
    if (!client) {
      socket.emit("error", "Session not found");
      return;
    }
    try {
      await client.sendMessage(to, message);
      console.log("Message sent successfully");
      socket.emit("messageSent", "Message sent successfully");
    } catch (error) {
      console.error("Error sending message:", error);
      socket.emit("error", "Error sending message");
    }
  });


  socket.on("getAllContacts", async (data) => {
    console.log("getAllContacts", data);
    const { id } = data;
    const client = allSessionObject[id];
    if (!client) {
      socket.emit("error", "Session not found");
      return;
    }
    try {
      const contacts = await client.getContacts();
      socket.emit("allContacts", contacts);
    } catch (error) {
      console.error("Error getting contacts:", error);
      socket.emit("error", "Error getting contacts");
    }
  });
  
});



