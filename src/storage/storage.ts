import { memoryStorage } from '@/storage/memory';
import { isNullOrUnDef } from '@/utls/is';

export type Storage = {
  
  readonly length: number;
  
  clear(): void;
  
  getItem(key: string): string | null;
  
  key(index: number): string | null;
  
  removeItem(key: string): void;
  
  setItem(key: string, value: string): void;
  
  [name: string]: any;
}

export enum StorageType {
  memory = 'memory',
  session = 'session',
  local = 'local',
}

export const storages: Record<StorageType, Storage> = {
  [StorageType.local]: window.localStorage,
  [StorageType.session]: window.sessionStorage,
  [StorageType.memory]: memoryStorage,
  
};

/**
 * value is storageType
 * @param storageType
 */
export function isStorageType(storageType?: StorageType): boolean {
  //  判断当前值是否为三个枚举值之一
  //  防止 JS 传入其它类型进行类型转换判断
  return !isNullOrUnDef(storageType) &&
    (Object.keys(storages)).includes(storageType.toString());
}