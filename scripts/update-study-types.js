const fs = require('fs');
const path = require('path');

const filePath = path.resolve(__dirname, '../UI_enhanced/src/components/study/study-types.ts');
let content = fs.readFileSync(filePath, 'utf8');

const cdnConst = 'export const STUDY_CDN_URL = "https://github.com/TienxDun/HUFLIT_GPA_Strategist/releases/download/v1.0.0-assets";\n\n';

if (!content.includes('STUDY_CDN_URL')) {
  content = cdnConst + content;
}

// Replace all local paths with CDN URL
content = content.replace(/"\/study\/(?:musics\/(?:lofi|jazz|relax)|sounds|scenes|thumbnails|authors)\/([^"]+)"/g, '`${STUDY_CDN_URL}/$1`');
content = content.replace(/"\/thumbnails\/([^"]+)"/g, '`${STUDY_CDN_URL}/$1`');

fs.writeFileSync(filePath, content, 'utf8');
console.log('Successfully replaced all study offline asset paths with CDN URLs!');
