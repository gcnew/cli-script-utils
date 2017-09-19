
function stripTypes(source) {
    return source.replace(
        /(?:\??: \w+|<\w+(, \w+)*>|: \([^)]*\) => \w+)(?:\[\])*/g,
        ''
    );
}

function importToRequire(source) {
    return source.replace(
        /import \* as (\w+) from ('[^']+');?/g,
        'const $1 = require($2);'
    );
}

function exportToModuleExports(source) {
    const exports = [];

    const noExports = source.replace(
        /export \{([^}]*)\}\r?\n/g,

        (_, exportItems) => {
            exports.push(exportItems.replace(/,\s*$/, ''));
            return '';
        }
    );

    return noExports + '\nmodule.exports = {\n' + exports.join(',\n') + '};\n';
}

const fs = require('fs');
const source = fs.readFileSync(process.argv[2], 'utf8');

const compiled = [
        stripTypes,
        importToRequire,
        exportToModuleExports
    ]
    .reduce(
        (s, f) => f(s),
        source
    );


console.log(compiled);
