
import * as fs from 'fs'
import * as Path from 'path'

export {
    glob, compileGlobPattern, readdirr, rmrf, mkdirr,
    exists, readFile, writeFile, unixPath,

    getFlagOption, getValueOption, match, trai, fail, die
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
    const rx = new RegExp(`^${ option }=(.+)$`);

    return process.argv.reduce(
        (res, arg) => (rx.exec(arg) || [])[1] || res,
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

function fail(msg?: string) {
    throw new Error(msg || 'Snap! I failed!');
}

function die(msg: string) {
    console.error(msg);
    process.exit(1);
}
