const fs = require('fs');
const path = require('path');

function replaceColors(content) {
    content = content.replace(/bg-\[\#0e0e10\]/g, 'bg-background');
    content = content.replace(/bg-\[\#141416\]/g, 'bg-surface-muted');
    content = content.replace(/bg-\[\#1a1a1e\]/g, 'bg-surface-raised');
    content = content.replace(/border-white\/\[0\.06\]/g, 'border-border');

    // Text colors
    content = content.replace(/text-zinc-200/g, 'text-text-primary');
    content = content.replace(/text-zinc-300/g, 'text-text-primary');
    content = content.replace(/text-zinc-400/g, 'text-text-secondary');
    content = content.replace(/text-zinc-500/g, 'text-text-muted');
    content = content.replace(/text-zinc-600/g, 'text-text-muted');

    // Bg hovers
    content = content.replace(/hover:bg-white\/5/g, 'hover:bg-foreground/5');
    content = content.replace(/hover:bg-white\/10/g, 'hover:bg-foreground/10');
    content = content.replace(/bg-white\/10/g, 'bg-foreground/10');

    return content;
}

// --- FILE EXPLORER ---
const fePath = path.join('c:', 'Users', 'Administrator', 'Documents', 'Desktop', 'styling ai', 'coderefine', 'components', 'FileExplorer.tsx');
let feContent = fs.readFileSync(fePath, 'utf-8');

if (!feContent.includes('import { ChevronRight, Folder, File, FilePlus, FolderPlus } from "lucide-react";')) {
    feContent = feContent.replace(
        'import { useState } from "react";',
        'import { useState } from "react";\nimport { ChevronRight, Folder, FileContent, FilePlus, FolderPlus } from "lucide-react";\n'
    );
}

feContent = replaceColors(feContent);

// SVGs
feContent = feContent.replace(
    /<svg className={`w-3\.5 h-3\.5 transition-transform \$\{node\.isOpen \? "rotate-90" : ""\}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" \/><\/svg>/g,
    '<ChevronRight className={`w-3.5 h-3.5 transition-transform ${node.isOpen ? "rotate-90" : ""}`} />'
);

feContent = feContent.replace(
    /<svg className="w-4 h-4 text-blue-400" viewBox="0 0 24 24" fill="currentColor"><path d="M10 4H4c-1\.1 0-1\.99\.9-1\.99 2L2 18c0 1\.1\.9 2 2 2h16c1\.1 0 2-\.9 2-2V8c0-1\.1-\.9-2-2-2h-8l-2-2z" \/><\/svg>/g,
    '<Folder className="w-4 h-4 text-blue-400" fill="currentColor" />'
);

feContent = feContent.replace(
    /<svg className="w-4 h-4 text-text-secondary shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9\.414a1 1 0 00-\.293-\.707l-5\.414-5\.414A1 1 0 0012\.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" \/><\/svg>/g,
    '<FileContent className="w-4 h-4 text-text-secondary shrink-0" />'
);

// Fallback for generic file if colors were already replaced
feContent = feContent.replace(
    /<svg className="w-4 h-4 text-text-secondary shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" \/><\/svg>/g,
    '<FileContent className="w-4 h-4 text-text-secondary shrink-0" />'
);

// Fallback for generic file if colors weren't replaced completely matching
feContent = feContent.replace(
    /<svg className="w-4 h-4 text-zinc-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" \/><\/svg>/g,
    '<FileContent className="w-4 h-4 text-text-secondary shrink-0" />'
);

feContent = feContent.replace(
    /<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5\.586a1 1 0 01\.707\.293l5\.414 5\.414a1 1 0 01\.293\.707V19a2 2 0 01-2 2z" \/><\/svg>/g,
    '<FilePlus className="w-4 h-4" />'
);

feContent = feContent.replace(
    /<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" \/><\/svg>/g,
    '<FolderPlus className="w-4 h-4" />'
);

fs.writeFileSync(fePath, feContent, 'utf-8');

// --- CHAT PANEL ---
const cpPath = path.join('c:', 'Users', 'Administrator', 'Documents', 'Desktop', 'styling ai', 'coderefine', 'components', 'ChatPanel.tsx');
let cpContent = fs.readFileSync(cpPath, 'utf-8');

if (!cpContent.includes('import { Send } from "lucide-react";')) {
    cpContent = cpContent.replace(
        'import React, { useEffect, useRef } from "react";',
        'import React, { useEffect, useRef } from "react";\nimport { Send } from "lucide-react";\n'
    );
}

cpContent = replaceColors(cpContent);

cpContent = cpContent.replace(
    /<svg className="w-5 h-5 -ml-0\.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" \/><\/svg>/g,
    '<Send className="w-5 h-5 -ml-0.5" />'
);

fs.writeFileSync(cpPath, cpContent, 'utf-8');

console.log('Successfully updated FileExplorer and ChatPanel');
