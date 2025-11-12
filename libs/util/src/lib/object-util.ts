import { diff } from 'deep-object-diff';
import cleanDeep, { CleanOptions } from 'clean-deep';
import deepEqual from 'deep-equal';
import objectPath from 'object-path';

export type StrictOmit<ObjectType, KeysType extends keyof ObjectType> = Pick<ObjectType, Exclude<keyof ObjectType, KeysType>>;

export class ObjectUtil {
  static cleanupEmptyProperties<T extends object>(obj: T, options?: CleanOptions): T;
  static cleanupEmptyProperties<T extends object | undefined>(obj: T | undefined, options?: CleanOptions): T | undefined;
  static cleanupEmptyProperties<T extends object | undefined>(obj: T | undefined, options?: CleanOptions): T | undefined {
    if (!obj) {
      return undefined;
    }

    const result = cleanDeep(obj, options);

    if (this.isObjectEmpty(result)) {
      return undefined;
    }

    return result as T;
  }

  static mergeOptions<TOptions extends object>(defaultOptions: TOptions) {
    return (value: Partial<TOptions>) => ({ ...defaultOptions, ...value });
  }

  static getPropertyValueByPath<TObject extends object>(obj: TObject, path: string): unknown {
    return objectPath.get(obj, path);
  }

  static setPropertyValueByPath<TObject extends object>(obj: TObject, path: string, value: unknown): void {
    objectPath.set(obj, path, value);
  }

  static isObjectEmpty(obj: object): boolean {
    return Object.keys(obj).length === 0;
  }

  static anyPropertyTruthy<T extends object>(obj: T, propertiesToCheck: (keyof T)[]): boolean {
    return propertiesToCheck.some(prop => !!obj[prop]);
  }

  static isTruthyNotEmpty(obj?: object): boolean {
    return !!obj && Object.keys(obj).length > 0;
  }

  static isObjectContentEqual<T extends object>(obj1: T, obj2: T): boolean {
    return deepEqual(obj1, obj2);
  }

  static removeProperties<T extends object, K extends keyof T>(obj: T, propertiesToRemove: K): StrictOmit<T, K>;
  static removeProperties<T extends object, K extends keyof T>(obj: T, propertiesToRemove: K[]): StrictOmit<T, K>;
  static removeProperties<T extends object, K extends keyof T>(obj: T, propertiesToRemove: K[] | K): StrictOmit<T, K> {
    const propertiesToRemoveArray = Array.isArray(propertiesToRemove) ? propertiesToRemove : [propertiesToRemove];
    const clone = { ...obj };
    propertiesToRemoveArray.forEach(prop => delete clone[prop]);
    return clone;
  }

  static diff<T extends object>(obj1: T, obj2: T): Partial<T> {
    return diff(obj1, obj2);
  }
}
