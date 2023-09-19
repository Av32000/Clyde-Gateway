import { WebSocket } from "ws";
import { Intents } from "./src/Intents";

type GatewayProperties = { os?: string; device?: string; browser?: string };
type Intent = keyof typeof Intents;
type User = {
  id: string;
  username: string;
  discriminator: string;
  global_name?: string;
  avatar?: string;
  bot?: boolean;
  system?: boolean;
  mfa_enabled?: boolean;
  banner?: string;
  accent_color?: number;
  locale?: string;
  verified?: boolean;
  email?: string;
  flags?: number;
  premium_type?: number;
  public_flags?: number;
  avatar_decoration?: string;
};

type Activity = {
  name: string;
  type: number;
  url?: string;
  created_at: number;
  timestamps?: { start?: number; end?: number };
  application_id?: string;
  details?: string;
  state?: string;
  emoji?: { name: string; id?: string; animated?: boolean };
  party?: { id?: string; size?: [number, number] };
  assets?: {
    large_image?: string;
    large_text?: string;
    small_image?: string;
    small_text?: string;
  };
  secrets?: { join?: string; spectate?: string; match?: string };
  instance?: boolean;
  flags?: number;
  buttons?: { label: string; url: string }[];
};

type Presence = {
  user: User;
  guild_id: string;
  status: string;
  activities: Activity[];
  client_status: {
    desktop?: string;
    mobile?: string;
    web?: string;
  };
};

type Member = {
  user?: User;
  nick?: string;
  avatar?: string;
  roles: string[];
  joined_at: string;
  premium_since?: string;
  deaf: boolean;
  mute: boolean;
  flags: number;
  pending?: boolean;
  permissions?: string;
  communication_disabled_until?: string;
  presence?: Presence;
};

class Client {
  finalIntents: number = 0;
  gateway: WebSocket;
  hearthbeat: number = 0;
  properties: GatewayProperties;
  token: String;
  callbacks = [];
  getGuildMembersCallback: (members: any) => void;
  members = [];

  constructor(
    token: string,
    intents: Intent[],
    properties: GatewayProperties = {}
  ) {
    if (!Array.isArray(intents)) {
      throw new Error("Please provide a valid array of intents");
    }

    for (const intent of intents) {
      this.finalIntents |= Intents[intent];
    }

    this.token = token;
    this.properties = properties;
    this.gateway = new WebSocket(
      "wss://gateway.discord.gg/?v=10&encoding=json"
    );

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
            if (json.d.chunk_index == 0) this.members = [];
            json.d.members.forEach((member: Member) => {
              member.presence = json.d.presences.find(
                (obj: Presence) => obj.user.id === member.user.id
              );
              this.members.push(member);
            });
            if (
              json.d.chunk_index + 1 == json.d.chunk_count &&
              this.getGuildMembersCallback != null
            ) {
              this.getGuildMembersCallback(this.members);
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
    this.getGuildMembersCallback = callback;
    this.gateway.send(
      JSON.stringify({
        op: 8,
        d: {
          guild_id: guildId,
          query: query || "",
          limit: limit || 0,
          user_ids: user_ids || null,
          presences: true,
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

export { Client };
