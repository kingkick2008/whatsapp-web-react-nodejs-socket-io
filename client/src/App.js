import React, { useState, useEffect } from "react";
import io from "socket.io-client";
import QRCode from "react-qr-code";
const socket = io.connect("http://localhost:4000", {});

function App() {
  const [session, setSession] = useState("");
  const [qrCode, setQrCode] = useState("");
  const createSessionFromWhatsapp = () => {
    socket.emit("createSession", {
      id: session,
    });
  };
  const [id, setId] = useState("");
  useEffect(() => {
    socket.emit("Connected", "Hello from clinet");

    socket.on("qr", (data) => {
      const { qr } = data;
      console.log(qr);
      setQrCode(qr);
    });

    socket.on("ready", (data) => {
      console.log(data);
      const { id } = data;
      setId(id);
    });
    socket.on("allChats", (data) => {
      console.log("allChats", data);
    });


    socket.on("allContacts", (data) => {
      console.log("allContacts", data);
    });
  }, []);

  const getAllChats = () => {
    socket.emit("getAllChats", { id });
  };
  const [message, setMessage] = useState("");
  const [to, setTo] = useState("");
  const sendMessage = () => {
    socket.emit("sendMessage", { id, to, message });
  };

  const getAllContacts = () => {
    socket.emit("getAllContacts", { id });
  };
  return (
    <div>
      <h1>WhatsApp-web.js Client</h1>
      <h1>Qr code</h1>
      <form>
        <input
          type="text"
          value={session}
          onChange={(e) => setSession(e.target.value)}
          placeholder="To"
        />

        <button type="button" onClick={createSessionFromWhatsapp}>
          Send
        </button>
      </form>

      <div>
        {id !== "" && (
          <button type="button" onClick={getAllChats}>
            Get all Chats
          </button>
        )}
      </div>
      <br />
      <button type="button" onClick={getAllContacts}>
        Get All Contacts
      </button>
      <QRCode
        size={256}
        style={{ height: "auto", maxWidth: "40%", width: "40%" }}
        value={qrCode}
        viewBox={`0 0 256 256`}
      />

      <br />
      {/* <form>
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Message"
        />
        <button type="button" onClick={sendMessage}>
          Send Message
        </button>
      </form> */}
      <div>
        <h1>WhatsApp-web.js Client</h1>
        <form>
          <input
            type="text"
            value={id}
            onChange={(e) => setId(e.target.value)}
            placeholder="Session ID"
          />
          <input
            type="text"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            placeholder="Recipient's Phone Number"
          />
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Message"
          />
          <button type="button" onClick={sendMessage}>
            Send Message
          </button>
        </form>
      </div>
    </div>
  );
}

export default App;
