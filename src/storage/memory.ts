import { isDef } from '@/utls/is';
import { Storage } from '@/storage/storage';

/**
 * 内存Storage
 */

const memoryData: Map<string, string | null> = new Map<string, string | null>();

export const memoryStorage: Storage = {
  
  key (_: number): string | null {
    return null;
  },
  setItem: (key: string, value: string) => {
    memoryData.set(key, value);
  },
  
  get length () {
    return memoryData.size;
  },
  
  getItem: (key: string) => {
    const value = memoryData.get(key);
    return isDef(value) ? value : null;
  },
  
  removeItem: (key: string) => {
    memoryData.delete(key);
  },
  
  clear: () => {
    memoryData.clear();
  },
};

