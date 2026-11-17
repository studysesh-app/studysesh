const fs = require('node:fs');
const path = require('node:path');

try {
    const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
    const key = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !key) throw new Error('Public Supabase URL and anon key are required for verification.');
    const directory = path.join('dist', '_expo', 'static', 'js', 'web');
    const files = fs.readdirSync(directory).filter((name) => name.endsWith('.js'));
    if (files.length === 0) throw new Error('No exported web JavaScript was found.');
    const bundles = files.map((name) => fs.readFileSync(path.join(directory, name), 'utf8'));
    if (!bundles.some((bundle) => bundle.includes(url)) || !bundles.some((bundle) => bundle.includes(key))) {
        throw new Error('The exported web bundle does not contain the expected public backend configuration.');
    }
    console.log('Exported web backend configuration matches the expected public settings.');
} catch (error) {
    console.error(error instanceof Error ? error.message : 'Web configuration verification failed.');
    process.exitCode = 1;
}
