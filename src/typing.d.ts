import CryptoJS from 'crypto-js';

declare module 'crypto-js' {
  export type WordArray = CryptoJS.lib.WordArray;
  export type CipherParams = CryptoJS.lib.CipherParams;
  
  export interface Format {
    /**
     * Converts a cipher params object to an OpenSSL-compatible string.
     *
     * @param cipherParams The cipher params object.
     *
     * @return The OpenSSL-compatible string.
     *
     * @example
     *
     *     var openSSLString = CryptoJS.format.OpenSSL.stringify(cipherParams);
     */
    stringify(cipherParams: CipherParams): string;
    
    /**
     * Converts an OpenSSL-compatible string to a cipher params object.
     *
     *
     * @return The cipher params object.
     *
     * @example
     *
     *     var cipherParams = CryptoJS.format.OpenSSL.parse(openSSLString);
     * @param str
     */
    parse(str: string): CipherParams;
  }
  
  export interface CipherOption {
    /**
     * The IV to use for this operation.
     */
    iv?: WordArray | undefined;
    format?: Format | undefined;
    
    [key: string]: any;
  }
}

export declare type ValueType =
  string
  | number
  | boolean
  | undefined
  | null
  | Symbol;

export declare type Expire = number | Date | null;

/**
 * 存储桶类型
 */
export declare type BucketName = string;


export  declare  type Encrypt = boolean | string

/**
 * 存储key类型
 */
export declare type StorageKey = string

export declare type WatchCallback = <V = any, OV = any>(
  value: V, oldValue: OV) => void;