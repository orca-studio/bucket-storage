import { BucketName, StorageType } from '@/types/index.d';
import { isNullOrUnDef, isValueType } from '@/utls/is';
import { isStorageType, Storage, storages } from '@/storage/storage';

/**
 * storage  类型
 */
export type StorageManageType<T> = Record<BucketName, T>;

export class BucketStorageBaseManager<T> {
  
  /**
   * 默认存储桶类型
   * @protected
   */
  protected readonly bucketName: BucketName;
  
  /**
   *  默认使用的storage类型
   * @protected
   */
  protected readonly storageType: StorageType;
  
  /**
   * 存储所有storage中所有keys
   * @protected
   */
  protected readonly manager: Map<StorageType, StorageManageType<T>>;
  
  constructor(storageType: StorageType, bucketName: BucketName) {
    this.bucketName = bucketName;
    this.storageType = storageType;
    
    this.manager = new Map<StorageType, StorageManageType<T>>();
  }
  
  protected getBucketName(bucketName?: BucketName): BucketName {
    return !isNullOrUnDef(bucketName) && isValueType(bucketName)
      ? bucketName.toString()
      : this.bucketName;
  }
  
  protected getStorageType(storageType?: StorageType): StorageType {
    return !isNullOrUnDef(storageType) && isStorageType(storageType)
      ? storageType
      : this.storageType;
  }
  
  protected getStorage(storageType?: StorageType): Storage {
    return storages[this.getStorageType(storageType)];
  }
  
  protected getCurrentStorageTypeManager(storageType?: StorageType): StorageManageType<T> | null {
    return this.manager?.get(this.getStorageType(storageType)) || null;
  }
  
  getCurrentBucket(
    bucketName?: BucketName,
    storageType?: StorageType): T | null {
    return this.getCurrentStorageTypeManager(storageType)?.[this.getBucketName(bucketName)] ||
      null;
  }
}