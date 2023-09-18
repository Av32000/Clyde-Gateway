const ws = require("ws");
const { Intents } = require("./src/Intents");
const { ActivityType } = require("./src/ActivityType");

class Client {
  finalIntents = 0;
  gateway = null;
  hearthbeat = 0;
  properties = {};
  token = "";
  callbacks = [];
  getGuildMembersCallback = null;
  members = []

  constructor(token, intents, properties) {
    if (!Array.isArray(intents)) {
      throw new Error("Please provide a valid array of intentions");
    }

    for (const intent of intents) {
      this.finalIntents |= intent;
    }

    this.token = token;
    this.properties = properties;
    this.gateway = new ws("wss://gateway.discord.gg/?v=10&encoding=json");

    this.gateway.on("message", (message) => {
      const json = JSON.parse(message.toString());
      if (json.op === 10) {
        this.hearthbeat = json.d.heartbeat_interval;
        this.StartHearthbeat();
      } else if (json.op === 0) {
        this.callbacks.forEach((element) => {
          if (element.event === json.t) {
            element.callbacks.forEach((callback) => {
              callback(json.d);
            });
          }
          if (json.t == "GUILD_MEMBERS_CHUNK") {
            if (json.d.chunk_index == 0) this.members = []
            json.d.members.forEach(member => {
              member.presence = json.d.presences.find(obj => obj.user.id === member.user.id)
              this.members.push(member)
            })
            if (json.d.chunk_index + 1 == json.d.chunk_count) {
              this.getGuildMembersCallback(this.members)
            }
          }
        });
      }
    });

    this.gateway.on("open", () => {
      this.login();
    });
  }

  login() {
    const payload = {
      op: 2,
      d: {
        token: this.token,
        intents: this.finalIntents,
        properties: this.properties || {
          os: "linux",
          browser: "clyde-gateway",
          device: "clyde-gateway",
        },
      },
    };
    this.gateway.send(JSON.stringify(payload));
  }

  on(event, callback) {
    let exist = false;
    this.callbacks.forEach((element) => {
      if (element.event === event) {
        element.callbacks.push(callback);
        exist = true;
      }
    });

    if (!exist) this.callbacks.push({ event: event, callbacks: [callback] });
  }

  updatePresence(status, activity, afk = false) {
    this.gateway.send(
      JSON.stringify({
        op: 3,
        d: {
          since: Date.now(),
          activities: [activity],
          status: status,
          afk: afk,
        },
      })
    );
  }

  getGuildMembers({ guildId, query, limit, user_ids }, callback) {
    this.getGuildMembersCallback = callback
    this.gateway.send(
      JSON.stringify({
        op: 8,
        d: {
          guild_id: guildId,
          query: query || "",
          limit: limit || 0,
          user_ids: user_ids || null,
          presences: true
        },
      })
    );
  }

  async StartHearthbeat() {
    await new Promise((r) => setTimeout(r, this.hearthbeat * 0.8));
    const payload = {
      op: 1,
      d: {
        heartbeat_interval: this.hearthbeat,
      },
    };
    this.gateway.send(JSON.stringify(payload));
    this.StartHearthbeat();
  }
}

module.exports = {
  Client,
  Intents,
  ActivityType
};
