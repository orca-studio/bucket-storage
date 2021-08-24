import { BucketStorage, StorageType } from '@/index';

function timeout(time: number) {
  return new Promise((resolve) => {
    setTimeout(() => resolve(true), time);
  });
}

/**
 * 默认
 */
test('bucket-storage default', () => {
  const data = { data: 'data' };
  
  const storage = new BucketStorage();
  
  storage.set('bucket-storage-default', data);
  
  expect(storage.get('bucket-storage-default')).toEqual(data);
  
  //  清除
  storage.remove('bucket-storage-default');
  
  expect(storage.get('bucket-storage-default')).toBeNull();
  
  storage.set('bucket-storage_default-clear-1', data);
  storage.set('bucket-storage_default-clear-2', data);
  
  expect(storage.get('bucket-storage_default-clear-1')).toEqual(data);
  expect(storage.get('bucket-storage_default-clear-2')).toEqual(data);
  
  //  清空
  storage.clear();
  
  expect(storage.get('bucket-storage_default-clear-1')).toBeNull();
  expect(storage.get('bucket-storage_default-clear-2')).toBeNull();
});

test('bucket-storage custom', async () => {
  const data = { data: 'data' };
  
  const storage = new BucketStorage({
    bucketName: '__',
    storageType: StorageType.local,
    expire: 1000,
    encryptOption: {
      iv: '1111111111111111',
      key: '1111111111111111',
    },
  });
  
  storage.set('bucket-storage_custom-default',data);
  
  expect(localStorage.getItem('____bucket-storage_custom-default')).not.toBeNull();
  
  await timeout(1500);
  
  expect(storage.get('bucket-storage_custom-default')).toBeNull();
  
  storage.set('bucket-storage_custom-function',data,{
    bucketName: '--',
    storageType: StorageType.session,
    expire: null,
  });
  
  expect(sessionStorage.getItem('--__bucket-storage_custom-function')).not.toBeNull();
  
  await timeout(1500);
  
  expect(storage.get('bucket-storage_custom-function',{
    bucketName: '--',
    storageType: StorageType.session,
  })).not.toBeNull();
  
});

/**
 * 超时
 */
test('bucket-storage expire', async () => {
  const value = { data: 'data' };
  //  expireStorage
  const expireStorage = new BucketStorage({ expire: 200 });
  //not-expireStorage
  const notExpireStorage = new BucketStorage({ expire: 3000 });
  
  //
  expireStorage.set('expire-storage_expire', value);
  notExpireStorage.set('expire-storage_not-expire', value);
  
  //  局部重写
  expireStorage.set('expire-storage_not-expire', value, { expire: null });
  notExpireStorage.set('expire-storage_expire', value, { expire: 200 });
  
  await timeout(1000);
  
  expect(expireStorage.get('expire-storage_expire')).toBeNull();
  expect(expireStorage.get('expire-storage_not-expire')).toEqual(value);
  
  expect(notExpireStorage.get('expire-storage_not-expire')).toEqual(value);
  expect(notExpireStorage.get('expire-storage_expire')).toBeNull();
});

/**
 * 加密
 */
test('bucket-storage encrypt', () => {
  const value = { data: 'data' };
  
  //  默认不加密
  const storage = new BucketStorage({
    encrypt: 'false',
    bucketName: '__',
  });
  
  storage.set('bucket-storage_not-encrypt', value);
  storage.set('bucket-storage_encrypt', value, {
    // 不为 false | ‘false’ 则代表true
    encrypt: 'tre',
  });
  
  //  加密
  console.log('encrypt', sessionStorage.getItem('____bucket-storage_encrypt'));
  
  expect(
    sessionStorage.getItem('____bucket-storage_encrypt'))
    .not
    .toEqual(JSON.stringify(value));
  
  //  未加密
  expect(
    JSON.parse(
      sessionStorage.getItem('____bucket-storage_not-encrypt')!)?.value)
    .toEqual(value);
});

/**
 * 监听
 */
test('bucket-storage watch', () => {
  const value = { data: 'data' };
  const newValue = { data: 'new-data' };
  
  const storage = new BucketStorage({
    bucketName: '__',
  });
  
  const watchUpdate = (newVal: Object, oldVal: Object) => {
    console.log('--------------watch-update---------------');
    expect(newValue).toEqual(newVal);
    expect(value).toEqual(oldVal);
  };
  //  添加监听
  storage.watch('bucket-storage_watch', watchUpdate);
  
  storage.set('bucket-storage_watch', value);
  
  expect(storage.get('bucket-storage_watch')).toEqual(value);
  
  storage.set('bucket-storage_watch', newValue);
  
  storage.unWatch('bucket-storage_watch', watchUpdate);
  
  const watchRemove = (newVal: null, oldVal: Object) => {
    console.log('--------------watch-remove---------------');
    expect(newVal).toBeNull();
    expect(oldVal).toEqual(newValue);
  };
  
  // @ts-ignore
  storage.watch('bucket-storage_watch', watchRemove);
  
  storage.remove('bucket-storage_watch');
  
  //
  expect(storage.get('bucket-storage_watch')).toBeNull();
});