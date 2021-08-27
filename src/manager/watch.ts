import { isNull } from '@/utls/is';
import { BucketStorageBaseManager } from '@/manager/base';
import { BucketName, StorageKey, StorageType, WatchCallback } from '@/types/index.d';

type WatchManageType = Record<StorageKey, Array<WatchCallback>>;

/**
 *BucketStorage中针对监听事件的管理器
 */
export class BucketStorageWatchManager extends BucketStorageBaseManager<WatchManageType> {
  constructor(storageType: StorageType, bucketName: BucketName) {
    super(storageType, bucketName);
  }
  
  exist(key: StorageKey, value: WatchCallback, options?: Partial<{
    storageType?: StorageType
    bucketName?: BucketName
  }>): boolean {
    
    return this.getCurrentBucket(options?.bucketName, options?.storageType)
        ?.[key]?.includes(value) ||
      false;
  }
  
  add(key: StorageKey, value: WatchCallback, options?: Partial<{
    storageType?: StorageType
    bucketName?: BucketName
  }>) {
    if (this.exist(key, value, options)) return;
    //
    const storageType = this.getStorageType(options?.storageType);
    
    //  not exist storageType
    !this.manager.has(storageType) &&
    (this.manager.set(storageType, {}));
    //
    const currentStorageTypeManager = this.getCurrentStorageTypeManager(
      storageType)!;
    
    const bucketName = this.getBucketName(options?.bucketName);
    
    // not exist bucket
    !currentStorageTypeManager[bucketName] &&
    (currentStorageTypeManager[bucketName] = {});
    
    !currentStorageTypeManager[bucketName][key] &&
    (currentStorageTypeManager[bucketName][key] = []);
    
    currentStorageTypeManager[bucketName][key].push(value);
  }
  
  get(key: StorageKey, options?: Partial<{
    storageType?: StorageType
    bucketName?: BucketName
  }>): Array<WatchCallback> {
    return this.getCurrentBucket(options?.bucketName,
      options?.storageType)?.[key] || [];
  }
  
  remove(key: StorageKey, value: WatchCallback, options?: Partial<{
    storageType?: StorageType
    bucketName?: BucketName
  }>) {
    if (!this.exist(key, value, options)) return;
    
    const currentBucket = this.getCurrentBucket(options?.bucketName,
      options?.storageType)!;
    
    currentBucket[key].splice(currentBucket[key].indexOf(value), 1);
  }
  
  clear(key: StorageKey, options?: Partial<{
    storageType?: StorageType
    bucketName?: BucketName
  }>) {
    const currentBucket = this.getCurrentBucket(options?.bucketName,
      options?.storageType);
    if (isNull(currentBucket) || !currentBucket[key]?.length) return;
    
    currentBucket[key].splice(0, currentBucket[key].length);
  }
}