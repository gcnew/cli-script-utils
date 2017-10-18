
export declare function glob(dir: string, pattern: string): string[];
export declare function compileGlobPattern(pattern: string): RegExp;
export declare function readdirr(path: string): string[];
export declare function rmrf(path: string): void;
export declare function mkdirr(path: string): void;
export declare function exists(path: string): boolean;
export declare function readFile(path: string): string;
export declare function writeFile(path: string, content: string): void;
export declare function unixPath(path: string): string;
export declare function getFlagOption(option: string): boolean;
export declare function getValueOption(option: string): string | undefined;
export declare function match(text: string, rx: RegExp): string[][];
export declare function trai<T>(f: () => T, def: T): T;
export declare function exit(code: number): never;
export declare function fail(msg?: string, marker?: Function): never;
export declare function die(msg: string): never;

