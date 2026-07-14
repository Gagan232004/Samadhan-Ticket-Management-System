const fs = require('fs');
const filePath = 'frontend/src/pages/Home.tsx';
let content = fs.readFileSync(filePath, 'utf8');

content = content.replace(/bg-zinc-950/g, 'bg-slate-50');
content = content.replace(/bg-\[\#030712\]/g, 'bg-slate-50');
content = content.replace(/bg-zinc-900\/50/g, 'bg-white');
content = content.replace(/bg-zinc-900\/40/g, 'bg-white');
content = content.replace(/bg-zinc-900\/95/g, 'bg-white');
content = content.replace(/bg-zinc-900/g, 'bg-white');
content = content.replace(/bg-zinc-800\/50/g, 'bg-slate-50');
content = content.replace(/bg-zinc-800\/80/g, 'bg-slate-50');
content = content.replace(/bg-zinc-800/g, 'bg-slate-100');
content = content.replace(/bg-zinc-950\/50/g, 'bg-slate-50');

content = content.replace(/text-zinc-200/g, 'text-slate-800');
content = content.replace(/text-zinc-300/g, 'text-slate-700');
content = content.replace(/text-zinc-400/g, 'text-slate-500');
content = content.replace(/text-zinc-500/g, 'text-slate-400');
content = content.replace(/prose-invert/g, '');
content = content.replace(/prose-zinc/g, 'prose-slate');

content = content.replace(/border-white\/5/g, 'border-slate-100');
content = content.replace(/border-white\/10/g, 'border-slate-200');
content = content.replace(/border-white\/\[0\.08\]/g, 'border-slate-200');
content = content.replace(/border-white\/20/g, 'border-slate-200');

content = content.replace(/ring-white\/10/g, 'ring-slate-100');
content = content.replace(/ring-white\/5/g, 'ring-slate-100');

content = content.replace(/text-white/g, 'text-slate-900');
content = content.replace(/text-slate-900\/20/g, 'text-white/20');

content = content.replace(/text-indigo-400/g, 'text-indigo-600');
content = content.replace(/text-indigo-300/g, 'text-indigo-700');
content = content.replace(/text-emerald-400/g, 'text-emerald-600');
content = content.replace(/text-emerald-300/g, 'text-emerald-700');
content = content.replace(/text-amber-400/g, 'text-amber-600');
content = content.replace(/text-amber-300/g, 'text-amber-700');
content = content.replace(/text-rose-400/g, 'text-rose-600');
content = content.replace(/text-red-400/g, 'text-red-600');
content = content.replace(/text-pink-400/g, 'text-pink-600');
content = content.replace(/text-teal-400/g, 'text-teal-600');
content = content.replace(/text-blue-400/g, 'text-blue-600');
content = content.replace(/text-fuchsia-400/g, 'text-fuchsia-600');

content = content.replace(/bg-white\/5/g, 'bg-slate-100');
content = content.replace(/bg-white\/10/g, 'bg-slate-200');
content = content.replace(/bg-white\/\[0\.02\]/g, 'bg-slate-50');
content = content.replace(/bg-white\/\[0\.03\]/g, 'bg-slate-50');

content = content.replace(/text-slate-900 hover:text-indigo-400/g, 'text-slate-600 hover:text-indigo-600');
content = content.replace(/font-bold text-slate-900 rounded-lg bg-indigo-500/g, 'font-bold text-white rounded-full bg-indigo-600');
content = content.replace(/bg-indigo-500 hover:bg-indigo-400 text-slate-900/g, 'bg-indigo-600 hover:bg-indigo-500 text-white rounded-full');

fs.writeFileSync(filePath, content);
console.log('Rewrote', filePath);
