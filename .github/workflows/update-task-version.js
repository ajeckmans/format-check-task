const fs = require('fs');
const path = require('path');

if (process.argv.length !== 4) {
    console.error('Usage: node update-task-version.js <semver> <path-to-task.json>');
    process.exit(1);
}

const semver = process.argv[2];
const taskJsonPath = path.resolve(process.argv[3]);

const taskJson = JSON.parse(fs.readFileSync(taskJsonPath, 'utf-8'));

const version = semver.split('.')

const patchVersion = version[3] ? "" + (version[2] + parseInt(version[3].substring(2)))  : version[2];
taskJson.version = {
    Major: version[0],
    Minor: version[1],
    Patch: patchVersion
};

fs.writeFileSync(taskJsonPath, JSON.stringify(taskJson, null, 2), 'utf-8');
console.log('Task version updated to:', semver);
