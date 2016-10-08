declare class Accesor<T> {
    root: T;
    constructor(root: T);
    get(path: string): void;
    set(path: string, value: any): void;
    refresh(): void;
    watch(path: string): void;
}
