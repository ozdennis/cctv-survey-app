const fs = require('fs');
const path = require('path');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(function (file) {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            results = results.concat(walk(file));
        } else {
            if (file.endsWith('route.ts')) results.push(file);
        }
    });
    return results;
}

const files = walk('src/app/api');
files.forEach(f => {
    let content = fs.readFileSync(f, 'utf8');
    let original = content;

    // Pattern 1: id only
    content = content.replaceAll('params: { id: string }', 'params: Promise<{ id: string }>');
    content = content.replaceAll('const id = params.id;', 'const { id } = await params;');

    // Pattern 2: id and camera_id
    content = content.replaceAll('params: { id: string, camera_id: string }', 'params: Promise<{ id: string, camera_id: string }>');
    content = content.replaceAll('const workOrderId = params.id;', 'const { id: workOrderId, camera_id } = await params;');
    content = content.replaceAll('const cameraNumber = parseInt(params.camera_id);', 'const cameraNumber = parseInt(camera_id);');

    // Pattern 3: GET with params.id
    if (content.includes('eq("id", params.id)')) {
        content = content.replace(
            /async function GET\(req: Request, \{ params \}: \{ params: Promise<\{ id: string \}> \}\) \{/g,
            'async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {\n    const { id } = await params;'
        );
        content = content.replaceAll('params.id', 'id');
    }

    if (content !== original) {
        fs.writeFileSync(f, content);
        console.log('Fixed:', f);
    }
});
