declare class BucketStorage {
  
  constructor(opt?: Partial<BucketStorageOption>)
  
  set<T>(key: StorageKey, value: T, options?: Partial<{
    encrypt?: Encrypt;
    bucketName?: BucketName;
    expire?: Expire;
    storageType?: StorageType
  }>): void
  
  get<T>(key: StorageKey, options?: Partial<{
    bucketName: BucketName;
    storageType: StorageType
  }>): T | null
  
  remove(key: StorageKey, options?: Partial<{
    storageType: StorageType
    bucketName: BucketName;
  }>): void
  
  clear(bucketName?: BucketName, options?: Partial<{
    storageType: StorageType
  }>): void
  
  watch(key: StorageKey, callback: WatchCallback, options?: Partial<{
    storageType: StorageType
    bucketName: BucketName;
  }>): void
  
  unWatch(key: StorageKey, callback: WatchCallback, options?: Partial<{
    storageType: StorageType
    bucketName: BucketName;
  }>): void
}

export default BucketStorage;


export declare interface BucketStorageOption {
  encrypt?: Encrypt;
  bucketName?: BucketName;
  expire?: Expire;
  storageType?: StorageType;
  encryptOption?: EncryptionOption;
}

export declare interface EncryptionOption {
  key: string;
  iv: string;
}

export  declare  type StorageType = 'memory' | 'session' | 'local'


/**
 * 过期时间类型，
 * number 滑动过期时间  过期时间为 （当前时间 + expire值）
 * Date   绝对过期时间  过期时间为 （expire值）
 * null   不设置过期时间
 */
export declare  type Expire = number | Date | null;

/**
 * 存储桶类型
 */
export declare  type BucketName = string;

export declare  type Encrypt = boolean | string

/**
 * 存储key类型
 */
export declare  type StorageKey = string

export declare  type WatchCallback<V = any, OV = any> = (
  value: V, oldValue: OV) => void;
