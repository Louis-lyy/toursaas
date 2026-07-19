import { isFeishuConfigured } from "../feishu/client";
import { feishuStore } from "./feishu-store";
import { fileStore } from "./file-store";
import type { PlatformStore } from "./types";

let store: PlatformStore | null = null;

export function getPlatformStore(): PlatformStore {
  if (store) return store;
  store = isFeishuConfigured() ? feishuStore : fileStore;
  return store;
}

export function getStoreMode() {
  return getPlatformStore().mode;
}
