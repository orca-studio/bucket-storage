import { logError } from '@/utls/log';
import { isNullOrUnDef } from '@/utls/is';
import { BUCKET_STORAGE_KEY } from '@/utls/const';
import { BucketName, StorageKey } from '@/typing';
import { storages, StorageType } from '@/storage/storage';
import { decodeByBase64, encryptByBase64 } from '@/utls/cipher';
import { BucketStorageBaseManager } from '@/manager/base';

type KeyBucketManageType = Array<StorageKey>;

/**
 * BucketStorage中存储key的管理类
 * 用于对所存储数据的key进行管理
 */
export class BucketStorageKeyManager extends BucketStorageBaseManager<KeyBucketManageType> {
  constructor(storageType: StorageType, bucketName: BucketName) {
    super(storageType, bucketName);
    this.init();
  }
  
  /**
   * 初始化当前所有key
   * @private
   */
  private init() {
    const fn = (storageType: StorageType) => {
      //  获取当前storage keys
      const storage = this.getStorage(storageType);
      const keysStr = storage.getItem(BUCKET_STORAGE_KEY);
      if (!keysStr) return;
      
      try {
        //  解密并添加至keys
        const keysData = JSON.parse(decodeByBase64(keysStr));
        this.manager.set(storageType, keysData);
      } catch (err) {
        this.manager.delete(storageType);
        logError(`init ${ storageType } keys`, err);
      }
    };
    (Object.keys(storages) as Array<StorageType>).forEach(type => { fn(type);});
  }
  
  exist(value: StorageKey, options?: Partial<{
    bucketName?: BucketName
    storageType?: StorageType
  }>): boolean {
    
    return this.getCurrentBucket(options?.bucketName, options?.storageType)
        ?.includes(value) ||
      false;
  }
  
  add(value: StorageKey, options?: Partial<{
    storageType?: StorageType
    bucketName?: BucketName
  }>) {
    if (this.exist(value, options)) return;
    
    const storageType = this.getStorageType(options?.storageType);
    
    //  not exist storageType
    !this.manager.has(storageType) &&
    (this.manager.set(storageType, {}));
    
    const currentStorageTypeManager = this.getCurrentStorageTypeManager(
      storageType)!;
    
    const bucketName = this.getBucketName(options?.bucketName);
    
    // not exist bucket
    !currentStorageTypeManager[bucketName] && (currentStorageTypeManager[bucketName] = []);
    
    currentStorageTypeManager[bucketName].push(value);
    
    this.durable(options?.storageType);
  }
  
  remove(value: StorageKey, options?: Partial<{
    storageType?: StorageType
    bucketName?: BucketName
  }>) {
    if (!this.exist(value, options)) return;
    
    const currentBucket = this.getCurrentBucket(options?.bucketName,
      options?.storageType)!;
    
    currentBucket.splice(currentBucket!.indexOf(value), 1);
    
    this.durable(options?.storageType);
  }
  
  clear(bucketName?: BucketName, storageType?: StorageType) {
    const currentBucket = this.getCurrentBucket(bucketName, storageType);
    
    if (!currentBucket?.length) return;
    
    currentBucket.splice(0, currentBucket.length);
    
    this.durable(storageType);
  }
  
  //TODO: 函数名称
  private durable(storageType?: StorageType) {
    storageType = this.getStorageType(storageType);
    const currentStorageKeys = this.getCurrentStorageTypeManager(storageType);
    if (isNullOrUnDef(currentStorageKeys)) return;
    
    const currentStorageKeysStr = encryptByBase64(
      JSON.stringify(currentStorageKeys));
    
    this.getStorage(storageType)
      .setItem(BUCKET_STORAGE_KEY, currentStorageKeysStr);
    
  }
}