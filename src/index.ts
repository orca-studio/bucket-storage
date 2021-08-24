import { logError } from '@/utls/log';
import { BucketStorageKeyManager } from '@/manager/key';
import { BucketStorageWatchManager } from '@/manager/watch';
import { BucketName, Encrypt, Expire, StorageKey, WatchCallback } from '@/typing';
import { DEFAULT_BUCKET_NAME, DEFAULT_ENCRYPTION_KEY, ENCRYPT_TEXT_SYMBOL } from '@/utls/const';
import { AesEncryption, Encryption, EncryptionOption } from '@/utls/cipher';
import { isStorageType, Storage, storages, StorageType } from '@/storage/storage';
import { isDate, isDef, isNull, isNullOrUnDef, isObject, isValueType } from '@/utls/is';

/**
 * 过期时间类型，
 * number 滑动过期时间  过期时间为 （当前时间 + expire值）
 * Date   绝对过期时间  过期时间为 （expire值）
 * null   不具有过期时间
 */

interface BucketStorageOption {
  encrypt?: Encrypt;
  bucketName?: BucketName;
  expire?: Expire;
  storageType?: StorageType;
  encryptOption?: EncryptionOption;
}

export class BucketStorage {
  /**
   * 默认是否进行加密
   * @private
   */
  private readonly encrypt: Encrypt = true;
  
  /**
   * 默认存储桶类型
   * @private
   */
  private readonly bucketName: BucketName = DEFAULT_BUCKET_NAME;
  
  /**
   * 默认过期时间
   * @private
   */
  private readonly expire: Expire = null;
  
  /**
   *  默认使用的storage类型
   * @private
   */
  private readonly storageType: StorageType = StorageType.session;
  
  private readonly encryption: Encryption;
  
  private readonly keyManager: BucketStorageKeyManager;
  private readonly watchManager: BucketStorageWatchManager;
  
  constructor(opt?: Partial<BucketStorageOption>) {
    const { encrypt, bucketName, expire, storageType, encryptOption } = opt ||
    {};
    
    //  默认存储桶
    //  1.当前值不为空并且为基础类型，使用值的字符串类型  防止 JS 传入 非字符串类型
    //  2.默认名称
    this.bucketName = !isNullOrUnDef(bucketName) && isValueType(bucketName)
      ? bucketName.toString()
      : DEFAULT_BUCKET_NAME;
    
    //  默认超出时间
    //  1.当前值不能转为Number，代表无过期时间（Date可以直接转换为Number）防止 JS 传入 非 number、Date 类型
    //  2.当前值为日期类型，代表绝对过期时间
    //  3.转换为number设置相对过期时间
    this.expire = !Number(expire) ? null : isDate(expire) ? expire : Number(
      expire);
    
    //  默认storage类型
    this.storageType = !isNullOrUnDef(storageType) && isStorageType(storageType)
      ? storageType
      : StorageType.session;
    
    //  默认是否加密
    //  防止 JS 传入其它类型， 当传入  'false' 或 false 代表 false 否则默认 true
    this.encrypt = encrypt?.toString() !== 'false';
    
    this.encryption = new AesEncryption(
      isObject(encryptOption) ? encryptOption : {
        iv: DEFAULT_ENCRYPTION_KEY,
        key: DEFAULT_ENCRYPTION_KEY,
      });
    
    this.keyManager = new BucketStorageKeyManager(this.storageType,
      this.bucketName);
    
    this.watchManager = new BucketStorageWatchManager(this.storageType,
      this.bucketName);
  }
  
  set<T>(key: StorageKey, value: T, options?: Partial<{
    encrypt?: Encrypt;
    bucketName?: BucketName;
    expire?: Expire;
    storageType?: StorageType
  }>) {
    //  无旧数据时为undefined（默认值）
    let oldData: T | undefined | null = undefined;
    //  获取旧数据
    this.keyManager.exist(key, options) &&
    (oldData = this.get(key, options));
    
    //  value、当前时间、过期时间
    const stringData = JSON.stringify({
      value: isDef(value) ? value : null,
      time: Date.now(),
      expire: this.getExpire(options?.expire),
    });
    
    //  数据加密
    const stringifyValue = this.encryptStr(stringData, options?.encrypt);
    
    this.getStorage(options?.storageType)
      .setItem(this.getKey(key, options?.bucketName), stringifyValue);
    
    isDef(oldData) && this.watchManager.get(key, options).forEach(callback => {
      callback(value, oldData);
    });
    //  更新key
    this.keyManager.add(key, options);
  }
  
  get<T>(key: StorageKey, options?: Partial<{
    bucketName: BucketName;
    storageType: StorageType
  }>): T | null {
    //  不存在此数据
    if (!this.keyManager.exist(key, options)) return null;
    
    const stringifyValue = this.getStorage(options?.storageType)
      .getItem(this.getKey(key, options?.bucketName));
    
    if (isNull(stringifyValue)) {
      return null;
    }
    
    try {
      //  解密
      const stringData = this.decryptStr(stringifyValue);
      
      const data = JSON.parse(stringData);
      
      const { value, expire } = data;
      
      //  判断当前数据是否过期，过期则删除数据
      if (isNullOrUnDef(expire) || expire >= Date.now()) {
        
        return value as T;
      }
      
      this.remove(key);
      
      // this.watchManager.get(key, options).forEach(callback => {
      //   callback(null, value);
      // });
      // //  更新key
      // this.keyManager.remove(key, options);
      return null;
      
    } catch (err) {
      logError(`get ${ key } value`, err);
      return null;
    }
  }
  
  /**
   * 删除指定项
   * @param key
   * @param options
   */
  remove(key: StorageKey, options?: Partial<{
    storageType: StorageType
    bucketName: BucketName;
  }>) {
    
    //TODO:没有判断已过期数据
    if (!this.keyManager.exist(key, options)) return;
    
    const storage = this.getStorage(options?.storageType);
    const watches = this.watchManager.get(key, options);
    
    key = this.getKey(key, options?.bucketName);
    
    const stringifyValue = watches?.length ? storage.getItem(key) : undefined;
    
    storage.removeItem(key);
    
    if (!isNullOrUnDef(stringifyValue)) {
      //  callback
      const stringData = this.decryptStr(stringifyValue);
      
      const data = JSON.parse(stringData);
      
      const { value } = data;
      
      watches.forEach(callback => {
        callback(null, value);
      });
    }
    
    //  更新key
    this.keyManager.remove(key, options);
  }
  
  /**
   * 清空指定桶
   * @param bucketName
   * @param options
   */
  clear(bucketName?: BucketName, options?: Partial<{
    storageType: StorageType
  }>) {
    
    const bucketKeys = this.keyManager?.getCurrentBucket(bucketName,
      options?.storageType);
    if (!bucketKeys?.length) return;
    
    const storage = this.getStorage(options?.storageType);
    
    bucketKeys.forEach(key => {
      storage.removeItem(this.getKey(key, bucketName));
    });
    
    //TODO:未触发watch
    
    //  更新key
    this.keyManager.clear(bucketName, options?.storageType);
  }
  
  /**
   * 添加监听
   * @param key
   * @param callback
   * @param options
   */
  watch(key: StorageKey, callback: WatchCallback, options?: Partial<{
    storageType: StorageType
    bucketName: BucketName;
  }>) {
    this.watchManager.add(key, callback, options);
  }
  
  // unWatch(key: StorageKey, options?: Partial<{
  //   storageType: StorageType
  //   bucketName: string;
  // }>): void
  //
  // unWatch(key: StorageKey, callback: WatchCallback, options?: Partial<{
  //   storageType: StorageType
  //   bucketName: string;
  // }>): void
  
  unWatch(key: StorageKey, callback: WatchCallback, options?: Partial<{
    storageType: StorageType
    bucketName: BucketName;
  }>) {
    
    this.watchManager.remove(key, callback, options);
  }
  
  private getStorageType(storageType?: StorageType): StorageType {
    return !isNullOrUnDef(storageType) && isStorageType(storageType)
      ? storageType
      : this.storageType;
  }
  
  private getStorage(type?: StorageType): Storage {
    return storages[this.getStorageType(type)];
  }
  
  private getBucketName(bucketName?: BucketName): BucketName {
    return !isNullOrUnDef(bucketName) && isValueType(bucketName)
      ? bucketName.toString()
      : this.bucketName;
  }
  
  private getKey(key: string, bucketName?: BucketName) {
    bucketName = this.getBucketName(bucketName);
    return `${ bucketName }__${ key }`;
  }
  
  private getExpire(expire?: Expire): Expire {
    const fn = (e?: Expire) => {
      return !Number(e) ? null : isDate(e)
        ? e.getTime()
        : new Date().getTime() + Number(e);
    };
    
    return isDef(expire) ? fn(expire) : fn(this.expire);
  };
  
  private encryptStr(value: string, encrypt?: Encrypt): string {
    encrypt = isDef(encrypt) ? encrypt.toString() !== 'false' : this.encrypt;
    return encrypt
      ? this.encryption.encrypt(value) + ENCRYPT_TEXT_SYMBOL
      : value;
  }
  
  private decryptStr(value: string): string {
    return value.endsWith(ENCRYPT_TEXT_SYMBOL)
      ? this.encryption.decrypt(value.substr(0,
        value.lastIndexOf(ENCRYPT_TEXT_SYMBOL)))
      : value;
  }
  
}

export {
  Expire,
  BucketStorageOption,
  StorageType,
};

