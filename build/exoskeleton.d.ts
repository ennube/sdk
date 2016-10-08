export declare type ArrayOrMapping<T> = T[] | {
    [key: string]: T;
};
export declare class Exoskeleton {
    constructor(value?: any);
    children: ArrayOrMapping<this>;
    readonly length: number;
    onDestroy(): void;
    onValue(value: any, changeDetected: boolean): boolean;
    protected createChild(value: any): this;
    updateValue(nextValue: any): boolean;
}
