const { execSync } = require('child_process');
const fs = require('fs');

const projectRoot = `${__dirname}/..`;

const folders = fs.readdirSync(projectRoot, { withFileTypes: true })
    .filter(f => f.isDirectory() && !f.name.startsWith('.'))
    .filter(f => fs.readdirSync(`${projectRoot}/${f.name}`).includes('action.yml'));
for (let dir of folders) {
    console.log(`Building ${dir.name}`);
    if (fs.existsSync(`${projectRoot}/${dir.name}/dist`)) {
        fs.rmSync(`${projectRoot}/${dir.name}/dist`, { recursive: true });
    }

    const jsFiles = fs.readdirSync(`${projectRoot}/${dir.name}`).filter(f => f.endsWith('.js'));
    for (let jsFile of jsFiles) {
        console.log(`  Packaging ${jsFile} as dist/${jsFile}`);
        execSync(`npx ncc build -o dist ${jsFile}`, { cwd: `${projectRoot}/${dir.name}`, encoding: 'utf8' });
        fs.renameSync(`${projectRoot}/${dir.name}/dist/index.js`, `${projectRoot}/${dir.name}/dist/${jsFile}`);
    }
}

console.log('Done');