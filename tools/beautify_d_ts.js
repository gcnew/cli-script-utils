
function inlineExports(source) {
    return source
        .replace(/export \{[^}]*\}\s*;\s*/g, '\n')
        .replace(/declare /g, 'export declare ');
}

const fs = require('fs');
const source = fs.readFileSync(process.argv[2], 'utf8');

console.log(inlineExports(source));
