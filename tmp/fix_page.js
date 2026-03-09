const fs = require('fs');
const path = require('path');

const filePath = path.join('c:', 'Users', 'Administrator', 'Documents', 'Desktop', 'styling ai', 'coderefine', 'app', 'app', 'page.tsx');
let content = fs.readFileSync(filePath, 'utf-8');

// 1. Add Lucide imports
if (!content.includes('import { Download, Upload, FileUp, FolderArchive, Activity, Terminal } from "lucide-react";')) {
    content = content.replace(
        'import JSZip from "jszip";',
        'import JSZip from "jszip";\nimport { Download, Upload, FileUp, FolderArchive, Activity, Terminal } from "lucide-react";'
    );
}

// 2. Replace hardcoded colors with CSS variables
content = content.replace(/bg-\[\#0e0e10\]/g, 'bg-background');
content = content.replace(/bg-\[\#141416\]/g, 'bg-surface-muted');
content = content.replace(/bg-\[\#1a1a1e\]/g, 'bg-surface-raised');
content = content.replace(/border-\[\#1e1e24\]/g, 'border-border');
content = content.replace(/border-white\/\[0\.06\]/g, 'border-border');

// Text colors
content = content.replace(/text-zinc-300/g, 'text-text-primary');
content = content.replace(/text-zinc-500/g, 'text-text-secondary');
content = content.replace(/text-zinc-600/g, 'text-text-muted');
content = content.replace(/text-zinc-400/g, 'text-text-secondary');
content = content.replace(/text-zinc-100/g, 'text-text-primary');

// Background hovers
content = content.replace(/hover:bg-white\/10/g, 'hover:bg-foreground/10');
content = content.replace(/bg-white\/10/g, 'bg-foreground/10');
content = content.replace(/bg-white\/\[0\.02\]/g, 'bg-foreground/5');
content = content.replace(/hover:bg-white\/\[0\.04\]/g, 'hover:bg-foreground/10');

// 3. Replace SVGs with Lucide Icons
// Download
content = content.replace(
    /<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4-4m0 0l-4-4m4 4V4" \/><\/svg>/g,
    '<Download className="w-4 h-4" />'
);

// Upload Menu Dropdown
content = content.replace(
    /<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" \/><\/svg>/g,
    '<Upload className="w-4 h-4" />'
);

// Single File Upload
content = content.replace(
    /<svg className="w-3\.5 h-3\.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5\.586a1 1 0 01\.707\.293l5\.414 5\.414a1 1 0 01\.293\.707V19a2 2 0 01-2 2z" \/><\/svg>/g,
    '<FileUp className="w-3.5 h-3.5" />'
);

// Zip Upload
content = content.replace(
    /<svg className="w-3\.5 h-3\.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" \/><\/svg>/g,
    '<FolderArchive className="w-3.5 h-3.5" />'
);

// Analyze
content = content.replace(
    /<svg className="w-3\.5 h-3\.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" \/><\/svg>/g,
    '<Activity className="w-3.5 h-3.5" />'
);

// Terminal 
content = content.replace(
    /<svg className="w-4 h-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" \/><\/svg>/g,
    '<Terminal className="w-4 h-4 text-blue-500" />'
);

fs.writeFileSync(filePath, content, 'utf-8');
console.log('Successfully updated app/page.tsx');
