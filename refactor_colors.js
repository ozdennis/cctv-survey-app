const fs = require('fs');

const files = [
    'src/app/sales/page.tsx',
    'src/app/vendor/page.tsx',
    'src/app/finance/page.tsx',
    'src/app/admin/page.tsx',
    'src/app/sales/[id]/page.tsx'
];

const colorMap = {
    '"#06080F"': '"var(--portal-bg)"',
    '"#0B0E17"': '"var(--portal-bg)"',
    '"#080D14"': '"var(--portal-bg)"',
    '"#050B0E"': '"var(--portal-bg)"',
    '"#000"': '"var(--portal-bg)"',
    '"#000000"': '"var(--portal-bg)"',
    '"#0D1117"': '"var(--portal-surface)"',
    '"#0B0F1A"': '"var(--portal-surface)"',
    '"#080C14"': '"var(--portal-header)"',
    '"#060912"': '"var(--portal-inner)"',
    '"#04060D"': '"var(--portal-inner)"',
    '"#04060A"': '"var(--portal-inner)"',
    '"#0A0D18"': '"var(--portal-inner)"',
    '"#0A0C14"': '"var(--portal-inner)"',
    '"#1E293B"': '"var(--portal-border)"',
    '"#0F172A"': '"var(--portal-border-dark)"',
    '"#F1F5F9"': '"var(--portal-text)"',
    '"#E2E8F0"': '"var(--portal-text)"',
    '"#CBD5E1"': '"var(--portal-text)"',
    '"#94A3B8"': '"var(--portal-muted)"',
    '"#64748B"': '"var(--portal-muted-dark)"',
    '"#475569"': '"var(--portal-faint)"',
    '"#334155"': '"var(--portal-faint)"',
    '"#fff"': '"var(--portal-bg-inverse)"',
    '"#ffffff"': '"var(--portal-bg-inverse)"',
    // some slightly different hexes from the dashboards
    '"rgba(0,0,0,0.8)"': '"var(--portal-overlay)"',
    '"rgba(0,0,0,0.6)"': '"var(--portal-shadow)"',
    '"#0A0A10"': '"var(--portal-inner)"'
};

files.forEach(file => {
    if (!fs.existsSync(file)) return;
    let content = fs.readFileSync(file, 'utf8');

    // Convert hexes to lowercase for regex
    Object.keys(colorMap).forEach(k => {
        const hex = k.replace(/"/g, '');
        if (hex.startsWith('#')) {
            const regex = new RegExp(`"${hex}"`, 'gi');
            content = content.replace(regex, colorMap[k]);
            const singleRegex = new RegExp(`'${hex}'`, 'gi');
            content = content.replace(singleRegex, colorMap[k].replace(/"/g, "'"));
        } else {
            const regex = new RegExp(`"${hex.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"`, 'gi');
            content = content.replace(regex, colorMap[k]);
            const singleRegex = new RegExp(`'${hex.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}'`, 'gi');
            content = content.replace(singleRegex, colorMap[k].replace(/"/g, "'"));
        }
    });

    // Handle string literals in templates
    Object.keys(colorMap).forEach(k => {
        const hex = k.replace(/"/g, '');
        if (hex.startsWith('#')) {
            const regex = new RegExp(`(?<=: |\\()${hex}(?=|\\)| |,|;)`, 'gi');
            // This is trickier, so we rely on exact literal replacements above first.
            // Let's also do a blanket replace for `#XXXXXX` when entirely standalone, but careful not to destroy real logic
        }
    });

    fs.writeFileSync(file, content);
    console.log(`Refactored inline colors in ${file}`);
});
