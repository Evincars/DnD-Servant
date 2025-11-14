import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class LocalStorageService {
  // errorService = inject(ErrorService);
  appName = 'DnD-Servant';

  localStorageDisabled = false;

  constructor() {
    try {
      localStorage.setItem('test', 'test');
      localStorage.removeItem('test');
    } catch (error) {
      this.localStorageDisabled = true;
      // TODO show toast here that we can't save user preferences
    }
  }

  getData<T>(key: string, hasToExist?: true, appSpecific?: boolean): Observable<T>;
  getData<T>(key: string, hasToExist?: false, appSpecific?: boolean): Observable<T | null>;
  getData<T>(key: string, hasToExist = false, appSpecific = true): Observable<T | null> {
    const value = this._getItem(key, appSpecific);
    if (value === null) {
      if (hasToExist) {
        throw new Error(`Local storage data with key ${key} does not exist.`);
      }
    }

    return of(value as T | null);
  }

  getDataSync<T>(key: string, appSpecific = true): T | null {
    const value = this._getItem(key, appSpecific);
    if (value === null) {
      return null;
    }

    return value as T;
  }

  setData<T>(key: string, value: T, appSpecific = true): Observable<T> {
    this._setItem(key, value, appSpecific);

    return of(value);
  }

  setDataSync<T>(key: string, value: T, appSpecific = true): void {
    this._setItem(key, value, appSpecific);
  }

  removeData(keys: string[], appSpecific = true): Observable<void> {
    keys.forEach(key => {
      this._removeItem(key, appSpecific);
    });

    return of(void 0);
  }

  clear(): void {
    if (this.localStorageDisabled) {
      return;
    }

    localStorage.clear();
  }

  private _setItem(key: string, value: unknown, appSpecific = true): void {
    if (this.localStorageDisabled) {
      return;
    }

    const scopedKey = appSpecific ? this._getScopedKey(key) : key;

    try {
      const valueString = JSON.stringify(value);
      localStorage.setItem(scopedKey, valueString);
    } catch (error) {
      // this.errorService.handleError(new LocalStorageError(error, CisErrorCode.CIS_ERROR_0050, scopedKey, value, 'set'));
      console.error('LocalStorage set error:', error);
    }
  }

  private _getItem<T>(key: string, appSpecific = true): T | null {
    if (this.localStorageDisabled) {
      return null;
    }

    const scopedKey = appSpecific ? this._getScopedKey(key) : key;
    const valueString = localStorage.getItem(scopedKey);

    if (valueString === null) {
      return null;
    }

    try {
      return JSON.parse(valueString) as T;
    } catch (error) {
      // this.errorService.handleError(new LocalStorageError(error, CisErrorCode.CIS_ERROR_0051, scopedKey, valueString, 'get'));
      console.error('LocalStorage get error:', error);
      return null;
    }
  }

  private _removeItem(key: string, appSpecific = true): void {
    if (this.localStorageDisabled) {
      return;
    }

    const scopedKey = appSpecific ? this._getScopedKey(key) : key;

    localStorage.removeItem(scopedKey);
  }

  private _getScopedKey(key: string): string {
    return `${this.appName}-${key}`;
  }
}
