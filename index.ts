
import * as fs from 'fs'
import * as Path from 'path'
import * as https from 'https'

export {
    glob, compileGlobPattern, compileGlobPredicate,
    readdirr, rmrf, mkdirr, exists, readFile, writeFile, unixPath,

    fetch,

    getFlagOption, getValueOption, match, trai, exit, fail, die
}

function glob(dir: string, pattern: string) {
    const files = readdirr(dir);
    const globRx = compileGlobPattern(pattern);

    return files.filter(f => globRx.test(f));
}

function compileGlobPattern(pattern: string) {
    const compiled = pattern
        .replace(/[+^${}()|\\]/g, "\\$&")
        .replace(/\./g, '\\.')
        .replace(/\?/g, '[^/]')
        .replace(
            /(?:\*\*\/?|\*)/g,

            matched => matched === '*' ? '[^/]*'
                                       : '(?:.*$|.*\/)?'
        );

    return new RegExp('^' + compiled + '$');
}

function compileGlobPredicate(globs: string[]) {
    const positive = globs
        .filter(x => !/^!/.test(x))
        .map(compileGlobPattern);

    const negative = globs
        .filter(x => /^!/.test(x))
        .map(x => compileGlobPattern(x.slice(1)));

    return (x: string) => positive.some(rx => rx.test(x)
                      && !negative.some(rx => rx.test(x)));
}

function readdirr(path: string) {
    return go(unixPath(path))
        .map(x => Path.relative(path, x));

    function go(path: string): string[] {
        if (!fs.existsSync(path)) {
            return [];
        }

        if (fs.statSync(path).isFile()) {
            return [ path ];
        }

        return Array.prototype.concat.apply(
            [],
            fs.readdirSync(path).map(p => go(path + '/' + p))
        );
    }
}

function rmrf(path: string) {
    if (!fs.existsSync(path)) {
        return;
    }

    if (fs.statSync(path).isFile()) {
        fs.unlinkSync(path);
        return;
    }

    fs.readdirSync(path).forEach(p => rmrf(path + '/' + p));
    fs.rmdirSync(path);
}

function mkdirr(path: string) {
    if (fs.existsSync(path)) {
        return;
    }

    const parent = Path.dirname(path);
    if (parent === path) {
        // this should never happen, but just in case..
        return;
    }

    mkdirr(parent);
    fs.mkdirSync(path);
}

function exists(path: string) {
    return fs.existsSync(path);
}

function readFile(path: string) {
    return fs.readFileSync(path, 'utf8');
}

function writeFile(path: string, content: string) {
    mkdirr(Path.dirname(path));
    fs.writeFileSync(path, content);
}

function unixPath(path: string) {
    return path.replace(/\\/g, '/');
}

function getFlagOption(option: string) {
    return process.argv.some(arg => arg === option);
}

function getValueOption(option: string) {
    const rx = new RegExp(`^${ option }(=(.+))?$`);

    return process.argv.reduce((res: string|undefined, arg, idx, arr) => {
            const matched = rx.exec(arg);

            return matched
                ? matched[1] && matched[2] || arr[idx + 1]
                : res;
        },

        undefined
    );
}

function match(text: string, rx: RegExp) {
    const retval: string[][] = [];

    text.replace(rx, (...matched: any[]) => {
        retval.push(matched.slice(0, -2));
        return matched[0];
    });

    return retval;
}

function trai<T>(f: () => T, def: T) {
    try {
        return f();
    } catch (_) {
        return def;
    }
}

function exit(code: number): never {
    return process.exit(code);
}

function fail(msg?: string, marker?: Function): never {
    const error = new Error(msg || 'Snap! I failed!');

    if (Error.captureStackTrace) {
        Error.captureStackTrace(error, marker || fail);
    }

    throw error;
}

function die(msg: string): never {
    console.error(msg);
    return process.exit(1);
}

function fetch(url: string) {
    return new Promise<string>((resolve, reject) => {
        const rq = https.get(url, res => {
            // follow redirects
            if ([301, 302, 303, 307, 308].includes(res.statusCode!)) {
                fetch(res.headers.location!).then(resolve, reject);
                return;
            }

            if (res.statusCode !== 200) {
                return reject(`Cannot fetch URL:${url}, statusCode:${res.statusCode}`)
            }

            const body: Buffer[] = [];
            res.on('data', chunk => body.push(chunk));
            res.on('end', () => resolve(Buffer.concat(body).toString('utf8')));
        });

        rq.on('error', err => reject(err));
        rq.end();
    });
}
