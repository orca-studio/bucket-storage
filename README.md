# bucket-storage

Bucket-storage is an easy storage. It supports rich functions

- data isolation using buckets
- `local`、`session`、`memory` mode storage
- data encryption
- data expiration time
- data changed watch

### install

> npm install bucket-storage
>
> yarn add bucket-storage

### Code timer

#### BucketStorage

```javascript
import { BucketStorage } from 'bucket-storage';

const storage = new BucketStorage();

const value = { data: 'data' };

// set value
storage.set('bucket-storage_test-default', data);

// get value
console.log(storage.get('bucket-storage_test-default'));

//  clear current bucket data
storage.clear();
```

##### Options

You can pass configuration options to `BucketStorage` constructor.

| Name          | Type                             | Default                                          | Description                                                                                                                                                      |
| ------------- | -------------------------------- | ------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| bucketName    | {String}                         | '\_\_BUCKET-STORAGE\_\_'                         | current `BucketStorage` default bucket name . You can setting other bucket name on `set()`                                                                       |
| encrypt       | { Boolean, String }              | false                                            | Indicates whether to encrypt. Setting 'false' or false is no encryption, other value is encryption                                                               |
| expire        | {Number, Date, null}             | null                                             | Set ths default data expiration time . null is setting does not expire, Date type express absolute expiration time; Number type express relative expiration time |
| storageType   | { 'local','session' , 'memory' } | 'session'                                        | Default storage type. Local value is using localStorage; Session value is using sessionStorage; Memory value is using memory object                              |
| encryptOption | Object                           | { key:'1234567890abcdef',iv:'1234567890abcdef' } | Setting data secret key. key and iv need sixteen strings;                                                                                                        |


#### override
support override config at set().

```javascript
const value = { data: 'data' };

// set value
storage.set('bucket-storage_test-default', data,{
  encrypt: false,
  bucketName:'__',
  expire: 3*1000,
  storageType:'local'
});

//  get value
storage.get('bucket-storage_test-default',{
  bucketName:'__',
  storageType:'local'
});
```

#### watch
support add data changed  using watch(). when data changed trigger callback

```javascript
const value = { data: 'data' };

// set value
storage.set('bucket-storage_test-default', data);


const callback = (newValue,oldValue) => {
  //
};
// add watch
storage.watch('bucket-storage_test-default',callback, {
  storageType:null,
  bucketName:null
})
storage.set('bucket-storage_test-default', { data:'newData' });

//  remove watch
storage.unWatch('bucket-storage_test-default',callback, {
  storageType:null,
  bucketName:null
})


```