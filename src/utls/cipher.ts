import { encrypt, decrypt } from 'crypto-js/aes';
import { WordArray } from 'crypto-js';
import ECB from 'crypto-js/mode-ecb';
import UTF8 from 'crypto-js/enc-utf8';
import Pkcs7 from 'crypto-js/pad-pkcs7';
import Base64 from 'crypto-js/enc-base64';
import { parse } from 'crypto-js/enc-utf8';
import { EncryptionOption } from '@/types';
import { DEFAULT_ENCRYPTION_KEY } from './const';



export interface Encryption{
  encrypt(text: string):string
  decrypt(ciphertext: string):string
}

export class AesEncryption implements Encryption{
  private readonly key: WordArray | string = '';
  private readonly iv: WordArray | undefined;
  
  constructor (opt: Partial<EncryptionOption> = {}) {
    const { key, iv } = opt;
    this.key = parse(key || DEFAULT_ENCRYPTION_KEY)
    this.iv = parse(iv || DEFAULT_ENCRYPTION_KEY)
  }
  
  private get getOptions (): CryptoJS.CipherOption {
    return {
      mode:  ECB,
      padding: Pkcs7,
      iv: this.iv,
    };
  }
  
  encrypt (text: string): string {
    return encrypt(text, this.key, this.getOptions).toString();
  }
  
  decrypt (ciphertext: string): string {
    return decrypt(ciphertext, this.key, this.getOptions).toString(UTF8);
  }
}


export function encryptByBase64(text: string) {
  return UTF8.parse(text).toString(Base64);
}

export function decodeByBase64(ciphertext: string) {
  return Base64.parse(ciphertext).toString(UTF8);
}