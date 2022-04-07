export declare type Option<T> = T | null | undefined;

export declare type Dict<T = any> = {
  [key: string]: T | undefined;
  [key: number]: T | undefined;
}