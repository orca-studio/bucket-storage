import { ValueType } from 'src/typing';

export function is(val: unknown, type: string) {
  return toString.call(val) === `[object ${ type }]`;
}

export function isDef<T = unknown>(val?: T): val is T {
  return typeof val !== 'undefined';
}

export function isUnDef<T = unknown>(val?: T): val is T {
  return !isDef(val);
}

export function isNull(val: unknown): val is null {
  return val === null;
}

export function isNullOrUnDef(val: unknown): val is null | undefined {
  return isUnDef(val) || isNull(val);
}

export function isObject(val: unknown): val is Record<string | number | symbol, unknown> {
  return !isNullOrUnDef(val) && is(val, 'Object');
}

export function isFunction(val: unknown): val is Function {
  return typeof val === 'function';
}

export function isArray(val: unknown): val is Array<unknown> {
  return !isNullOrUnDef(val) && is(val, 'Array');
}

export function isValueType(val: unknown): val is ValueType {
  return !isArray(val) && !isObject(val);
}

export function isNumber(val: unknown): val is number {
  return is(val, 'Number');
}

export function isDate(val: unknown): val is Date {
  return is(val, 'Date');
}


