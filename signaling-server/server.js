#!/usr/bin/env node

const WebSocket = require("ws");

const PORT = process.env.PORT || 4444;
const HOST = process.env.HOST || "0.0.0.0";

const wss = new WebSocket.Server({ host: HOST, port: PORT });

const topics = new Map();

const send = (conn, message) => {
  try {
    if (conn.readyState === WebSocket.OPEN) {
      conn.send(JSON.stringify(message));
    }
  } catch (e) {
    // ignore
  }
};

const onConnection = (conn) => {
  const subscribedTopics = new Set();
  let closed = false;

  conn.on("message", (raw) => {
    let message;
    try {
      message = JSON.parse(raw.toString());
    } catch (e) {
      return;
    }

    if (message && message.type) {
      switch (message.type) {
        case "subscribe":
          (message.topics || []).forEach((topicName) => {
            if (typeof topicName === "string") {
              let topic = topics.get(topicName);
              if (!topic) {
                topic = new Set();
                topics.set(topicName, topic);
              }
              topic.add(conn);
              subscribedTopics.add(topicName);
            }
          });
          break;
        case "unsubscribe":
          (message.topics || []).forEach((topicName) => {
            const topic = topics.get(topicName);
            if (topic) {
              topic.delete(conn);
              if (topic.size === 0) topics.delete(topicName);
            }
            subscribedTopics.delete(topicName);
          });
          break;
        case "publish":
          if (message.topic) {
            const receivers = topics.get(message.topic);
            if (receivers) {
              message.clients = receivers.size;
              receivers.forEach((receiver) => {
                if (receiver !== conn) {
                  send(receiver, message);
                }
              });
            }
          }
          break;
        case "ping":
          send(conn, { type: "pong" });
          break;
      }
    }
  });

  conn.on("close", () => {
    if (closed) return;
    closed = true;
    subscribedTopics.forEach((topicName) => {
      const topic = topics.get(topicName);
      if (topic) {
        topic.delete(conn);
        if (topic.size === 0) topics.delete(topicName);
      }
    });
  });

  conn.on("error", () => {
    // handled by close event
  });
};

wss.on("connection", onConnection);

console.log(`y-webrtc signaling server running on ${HOST}:${PORT}`);
