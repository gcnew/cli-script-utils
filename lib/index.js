
const fs = require('fs');
const Path = require('path');


function glob(dir, pattern) {
    const files = readdirr(dir);
    const globRx = compileGlobPattern(pattern);

    return files.filter(f => globRx.test(f));
}

function compileGlobPattern(pattern) {
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

function readdirr(path) {
    return go(unixPath(path))
        .map(x => Path.relative(path, x));

    function go(path) {
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

function rmrf(path) {
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

function mkdirr(path) {
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

function exists(path) {
    return fs.existsSync(path);
}

function readFile(path) {
    return fs.readFileSync(path, 'utf8');
}

function writeFile(path, content) {
    mkdirr(Path.dirname(path));
    fs.writeFileSync(path, content);
}

function unixPath(path) {
    return path.replace(/\\/g, '/');
}

function getFlagOption(option) {
    return process.argv.some(arg => arg === option);
}

function getValueOption(option) {
    const rx = new RegExp(`^${ option }=(.+)$`);

    return process.argv.reduce(
        (res, arg) => (rx.exec(arg) || [])[1] || res,
        undefined
    );
}

function match(text, rx) {
    const retval = [];

    text.replace(rx, (...matched) => {
        retval.push(matched.slice(0, -2));
        return matched[0];
    });

    return retval;
}

function trai(f, def) {
    try {
        return f();
    } catch (_) {
        return def;
    }
}

function exit(code) {
    return process.exit(code);
}

function fail(msg) {
    throw new Error(msg || 'Snap! I failed!');
}

function die(msg) {
    console.error(msg);
    return process.exit(1);
}

module.exports = {

    glob, compileGlobPattern, readdirr, rmrf, mkdirr,
    exists, readFile, writeFile, unixPath,

    getFlagOption, getValueOption, match, trai, exit, fail, die
};

