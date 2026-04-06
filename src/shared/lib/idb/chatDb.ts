import { openDB, type DBSchema } from "idb";
import type { ChatMessage } from "../../entities/message/model";

type ProfileRecord = {
  key: "profile";
  value: {
    name: string;
    userId: string;
    sessionToken: string;
    isAdmin: boolean;
  };
};

type OutboxRecord = {
  key: string; // messageId
  value: {
    messageId: string;
    text: string;
    createdAt: string; // ISO
  };
};

type ChatDbSchema = DBSchema & {
  profile: {
    key: "profile";
    value: ProfileRecord["value"];
  };
  messages: {
    key: ChatMessage["id"];
    value: ChatMessage;
  };
  outbox: {
    key: string;
    value: OutboxRecord["value"];
  };
};

const DB_NAME = "chatt-db";
const DB_VERSION = 1;

function getDb() {
  return openDB<ChatDbSchema>(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains("profile")) db.createObjectStore("profile");
      if (!db.objectStoreNames.contains("messages")) db.createObjectStore("messages");
      if (!db.objectStoreNames.contains("outbox")) db.createObjectStore("outbox");
    },
  });
}

export async function idbGetProfile(): Promise<ProfileRecord["value"] | null> {
  const db = await getDb();
  const profile = await db.get("profile", "profile");
  return profile ?? null;
}

export async function idbSetProfile(profile: ProfileRecord["value"]): Promise<void> {
  const db = await getDb();
  await db.put("profile", profile, "profile");
}

export async function idbClearProfile(): Promise<void> {
  const db = await getDb();
  await db.delete("profile", "profile");
}

export async function idbGetMessages(): Promise<ChatMessage[]> {
  const db = await getDb();
  const all = await db.getAll("messages");
  all.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  return all;
}

export async function idbUpsertMessage(msg: ChatMessage): Promise<void> {
  const db = await getDb();
  await db.put("messages", msg, msg.id);
}

export async function idbDeleteMessage(messageId: string): Promise<void> {
  const db = await getDb();
  await db.delete("messages", messageId);
}

export async function idbClearMessages(): Promise<void> {
  const db = await getDb();
  await db.clear("messages");
}

export async function idbAddToOutbox(item: OutboxRecord["value"]): Promise<void> {
  const db = await getDb();
  await db.put("outbox", item, item.messageId);
}

export async function idbGetOutbox(): Promise<OutboxRecord["value"][]> {
  const db = await getDb();
  const all = await db.getAll("outbox");
  all.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  return all;
}

export async function idbRemoveFromOutbox(messageId: string): Promise<void> {
  const db = await getDb();
  await db.delete("outbox", messageId);
}

export async function idbClearOutbox(): Promise<void> {
  const db = await getDb();
  await db.clear("outbox");
}

