# cli-script-utils
This repository contains some of the utility functions that I've used for almost any cli script that I've written.
The focus has been on simplicity and brevity.

These functions have by no means been completely tested, or are overly-powerful or configurable.
However, they have no external and very few interal dependencies so that inlining (copy-pasting) into scripts is easy.

# Functions

#### `glob(dir: string, pattern: string): string[]`
A simple glob implementation.

#### `compileGlobPattern(pattern: string): RegExp`
Compiles a given glob pattern to a RegExp.  
**WARNING**: Not a standards compliant implementation.

#### `compileGlobPredicate(globs: string[]): (x: string) => boolean`
Compiles a the given glob patterns to a predicate function. Globs are devided into positive
and neative ones (i.e. starting with `!`). The compiled predicate returns true if its
argument matches _any_ of the positive globs and _none_ of the negative ones.

```js
const predicate = compileGlobPredicate([
    '**/*.js',
    '!built/**/*'
]);

predicate('hello.js'); // true
predicate('built/hello.js'); // false
```

#### `readdirr(path: string): string[]`
A recursive synchronous version of `readdir`.
Useful for reading the contents of a directory which may contain other nested directories.
Doesn't throw if the specified path doesn't exist or leads to a file.

#### `rmrf(path: string): void`
A recursive synchronous version of `rm`.
Useful for deleting directories which may contain other nested directories.
Doesn't throw if the specified path doesn't exist.

#### `mkdirr(path: string): void`
A recursive synchronous version of `mkdir`.
Useful when creating nested directories.

#### `exists(path: string): boolean`
An alias for `fs.existsSync`.

#### `readFile(path: string): string`
Synchronously reads the file at the specified path and returns its content as a UTF-8 encoded string.

#### `writeFile(path: string, content: string): void`
Synchronously writes a file at the specified path with the provided content.

#### `unixPath(path: string): string`
Given a path that contains forward and/or backward slashes, returns a path with forward slashes only.

#### `fetch(url: string): Promise<string>`
Makes an HTTPS GET request and returns the content of the response. Redirects are followed. Currently only GET is supported.

#### `getFlagOption(option: string): boolean`
Checks `argv` and returns whether such an option has been provided.

```js
// argv: [ 'node', 'myscript.js', '--verbose' ]
getFlagOption('--verbose'); // true
getFlagOption('--version'); // false
```

#### `getValueOption(option: string): string`
Retrieves the value provided to `option` as string.

```js
// argv: [ 'node', 'myscript.js', '--path=built/main.js', '--positioned', 'next-pos' ]
getValueOption('--path'); // 'built/main.js'
getValueOption('--positioned'); // 'next-pos'
```

#### `match(text: string, rx: RegExp): string[][]`
Executes the RegExp `rx` on `text` and returns the results of all matches.

#### `trai<T>(f: () => T, def: T): T`
An expression varion of `try`. Executes the provided thunk `f` and returns its result.
In case of an error, returns the default value `def`.

#### `exit(code: number): never`
An alias for `process.exit`.

#### `fail(msg?: string, marker?: Function): never`
An expression version of `throw`. Throws an `Error` with the provided message.  
NOTE: If a `marker` function is provided and the host environment allows stack trace manipulation, all frames following and including `marker` will be omitted.

#### `die(msg: string): never`
Akin to `fail` but calls `process.exit(1)` instead of throwing an exception. The message is logged on `stderr`.


