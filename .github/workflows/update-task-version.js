const fs = require('fs');
const path = require('path');

const extensionJsonPath = path.join(__dirname, 'vss-extension.json');
const taskJsonPath = path.join(__dirname, 'tasks', 'MyTask', 'task.json');

const extensionJson = JSON.parse(fs.readFileSync(extensionJsonPath, 'utf-8'));
const taskJson = JSON.parse(fs.readFileSync(taskJsonPath, 'utf-8'));

const version = extensionJson.version.split('.');
taskJson.version = {
    Major: version[0],
    Minor: version[1],
    Patch: version[2]
};

fs.writeFileSync(taskJsonPath, JSON.stringify(taskJson, null, 2), 'utf-8');
console.log('Task version updated to:', extensionJson.version);
