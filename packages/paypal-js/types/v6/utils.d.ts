export type Camelize<T extends string> = T extends
    | `${infer A}_${infer B}`
    | `${infer A}-${infer B}`
    ? `${A}${Camelize<Capitalize<B>>}`
    : T;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type CamelizeObjectKeys<T extends Record<string, any>> = {
    [K in keyof T as Camelize<K & string>]: T[K];
};
