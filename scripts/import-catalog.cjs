const fs = require('node:fs');
const path = require('node:path');

function normalizeCatalog(input, minimum = 3000, minPrefixes = 80) {
    if (!Array.isArray(input)) throw new Error('Catalog input must be a JSON array.');
    if (input.length < minimum || input.length > 20000) throw new Error(`Catalog must contain between ${minimum} and 20000 courses.`);
    const codes = new Set();
    const prefixes = new Set();
    const courses = input.map((item, index) => {
        if (!item || typeof item.code !== 'string' || typeof item.name !== 'string') {
            throw new Error(`Course ${index + 1} must contain string code and name fields.`);
        }
        if (/[\u0000-\u001f\u007f]/.test(item.code) || /[\u0000-\u001f\u007f]/.test(item.name)) {
            throw new Error(`Course ${index + 1} contains control characters.`);
        }
        const code = item.code.trim().toUpperCase().replace(/ +/g, ' ');
        const name = item.name.trim().replace(/ +/g, ' ');
        if (!/^[A-Z]{2,5} [0-9]{4}[A-Z]?$/.test(code) || !name || name.length > 300) {
            throw new Error(`Course ${index + 1} has an invalid code or name.`);
        }
        if (codes.has(code)) throw new Error(`Duplicate course code: ${code}`);
        codes.add(code);
        prefixes.add(code.split(' ')[0]);
        return { code, name };
    });
    if (prefixes.size < minPrefixes) throw new Error(`Catalog must contain at least ${minPrefixes} subject prefixes.`);
    return courses.sort((a, b) => a.code.localeCompare(b.code, 'en'));
}

function validateYear(year) {
    const match = /^(\d{4})-(\d{2})$/.exec(year);
    if (!match || (Number(match[1]) + 1) % 100 !== Number(match[2])) {
        throw new Error('Calendar year must look like 2026-27.');
    }
    return year;
}

function buildMigration(courses, year) {
    validateYear(year);
    const quote = (value) => `'${value.replace(/'/g, "''")}'`;
    const batches = [];
    for (let index = 0; index < courses.length; index += 500) {
        batches.push(`INSERT INTO catalog_import (code, name) VALUES\n${courses.slice(index, index + 500)
            .map((course) => `  (${quote(course.code)}, ${quote(course.name)})`).join(',\n')};`);
    }
    return [
        `-- Catalog ${year}; generated from an operator-supplied, authorized source.`,
        'BEGIN;',
        'SET LOCAL standard_conforming_strings = on;',
        'CREATE TEMP TABLE catalog_import (code TEXT PRIMARY KEY, name TEXT NOT NULL) ON COMMIT DROP;',
        ...batches,
        'UPDATE public.courses c SET is_active = FALSE WHERE c.is_active AND NOT EXISTS (SELECT 1 FROM catalog_import i WHERE i.code = c.code);',
        'INSERT INTO public.courses (code, name, is_active)',
        'SELECT code, name, TRUE FROM catalog_import',
        'ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, is_active = TRUE;',
        'COMMIT;',
        '',
    ].join('\n');
}

function parseArgs(args) {
    const result = {};
    for (let index = 0; index < args.length; index += 2) {
        const key = args[index];
        if (!['--input', '--sql', '--json', '--year', '--minimum', '--min-prefixes'].includes(key) || !args[index + 1] || result[key]) {
            throw new Error('Use --input FILE --sql NEW_FILE --json NEW_FILE --year YYYY-YY [--minimum N] [--min-prefixes N].');
        }
        result[key] = args[index + 1];
    }
    if (!result['--input'] || !result['--sql'] || !result['--json'] || !result['--year']) {
        throw new Error('Use --input FILE --sql NEW_FILE --json NEW_FILE --year YYYY-YY [--minimum N] [--min-prefixes N].');
    }
    return result;
}

function main(args) {
    const options = parseArgs(args);
    const minimum = options['--minimum'] === undefined ? 3000 : Number(options['--minimum']);
    const minPrefixes = options['--min-prefixes'] === undefined ? 80 : Number(options['--min-prefixes']);
    if (!Number.isInteger(minimum) || minimum < 1 || !Number.isInteger(minPrefixes) || minPrefixes < 1) {
        throw new Error('Minimum counts must be positive integers.');
    }
    const inputPath = path.resolve(options['--input']);
    const sqlPath = path.resolve(options['--sql']);
    const jsonPath = path.resolve(options['--json']);
    if (new Set([inputPath, sqlPath, jsonPath]).size !== 3) throw new Error('Input and output paths must be different.');
    const courses = normalizeCatalog(JSON.parse(fs.readFileSync(inputPath, 'utf8')), minimum, minPrefixes);
    const sql = buildMigration(courses, options['--year']);
    let sqlCreated = false;
    try {
        fs.writeFileSync(sqlPath, sql, { flag: 'wx' });
        sqlCreated = true;
        fs.writeFileSync(jsonPath, `${JSON.stringify(courses, null, 2)}\n`, { flag: 'wx' });
    } catch (error) {
        if (sqlCreated) fs.unlinkSync(sqlPath);
        throw error;
    }
    console.log(`Generated ${courses.length} courses. Review both files before using them.`);
}

module.exports = { normalizeCatalog, validateYear, buildMigration, main };
if (require.main === module) {
    try { main(process.argv.slice(2)); }
    catch (error) { console.error(error instanceof Error ? error.message : 'Catalog import failed.'); process.exitCode = 1; }
}
