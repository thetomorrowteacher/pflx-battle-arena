const fs=require('fs'),vm=require('vm');const h=fs.readFileSync(process.argv[2]||'arena.html','utf8');
function fn(name){const re=new RegExp('(async )?function '+name+'\\s*\\(');const m=re.exec(h);if(!m)throw name;let i=h.indexOf('{',m.index),d=0;for(;i<h.length;i++){if(h[i]=='{')d++;else if(h[i]=='}'){d--;if(!d)break}}return h.slice(m.index,i+1);}
const evo=h.slice(h.indexOf('/* EVO10 -- ten-level'),h.indexOf('const EXO_STAGE_XP'));
const lines=h.slice(h.indexOf('const EXO_LINES'),h.indexOf('const EXO_STAGE_XP')).replace(evo,'').replace('const EXO_LINES','var EXO_LINES');
let saved=[],toasts=[];
const ctx={console,Math,JSON,Date,Object,Array,String,Number,Promise,setTimeout:()=>0,confirm:()=>true,
 state:{player:{id:'p1',studioId:'studio-innov8'},screen:'exo_bay'},PLAYERS:[{id:'p1',studioId:'studio-innov8',brandName:'P1'}],
 EXO_STATE:{byPlayer:{}},SUPABASE_URL:'x',SUPABASE_KEY:'k',SFX:{click(){},victory(){}},render(){},
 fetch:(u,o)=>{saved.push([u,o&&o.body]);return Promise.resolve({ok:true})},exoLedger(){},exoToastMsg:t=>toasts.push(t),isHostUser:()=>true,
 exoSVGProcedural:()=>'<svg/>',ARENA_STUDIOS:{}};
vm.createContext(ctx);
const src=evo+';'+lines+';const EXO_STAGE_XP=[0,500,2500,8000,20000];'+['exoLevel','exoTierName','exoCardLabel','exoEscape','exoEscapeLong','exoLineForStudio','exoGet','exoReconcileStudio','exoArtFile','exoArtHTML','exoSVG','exoGrantSync','exoEvolutionShow','exoPatchRow','exoPathPanelHTML','exoChoosePath','exoHostEvoToolsHTML','exoHostGrantL10','exoHostResetPath','exoSaveRow'].map(fn).join('\n')+';var EXO_ART_BASE="assets/exo/";';
vm.runInContext(src,ctx);
let pass=0,fail=0;const ok=(c,m)=>{c?pass++:(fail++,console.log('FAIL',m))};
(async()=>{
const C=ctx; C.EXO_STATE.byPlayer.p1={player_id:'p1',line:'neonborn',stage:1,sync_xp:0,level:1,branch:'BASE',colorway:'default'};
let a=vm.runInContext("exoArtHTML(exoGet('p1'),170,'x')",C); ok(/neonborn\/1-base-default-standard\.web\.jpg/.test(a),'web art L1'); ok(!/\.png/.test(a),'no png');
a=vm.runInContext("exoArtHTML(exoGet('p1'),40,'x')",C); ok(/thumb\.jpg/.test(a),'thumb small');
await vm.runInContext("exoGrantSync('p1',600,'t')",C); let r=C.EXO_STATE.byPlayer.p1; ok(r.level===3&&r.stage===2,'grant -> L3 tier2 '+r.level);
ok(/Choose your path/.test(vm.runInContext("exoPathPanelHTML(exoGet('p1'))",C)),'path panel');
await vm.runInContext("exoChoosePath('C')",C); ok(r.branch==='C','chose C'); ok(saved.some(s=>/"branch":"C"/.test(s[1]||'')),'PATCH sent');
await vm.runInContext("exoChoosePath('A1')",C); ok(r.branch==='C','cannot jump to A1');
a=vm.runInContext("exoArtHTML(exoGet('p1'),170,'x')",C); ok(/neonborn\/3-c-default-standard\.web\.jpg/.test(a),'L3 C art');
await vm.runInContext("exoGrantSync('p1',100000,'t')",C); ok(r.level===9,'cap 9');
ok(/GRANT LV 10/.test(vm.runInContext("exoHostEvoToolsHTML()",C)),'host grant button'); ok(/disabled/.test(vm.runInContext("exoHostEvoToolsHTML()",C)),'disabled until path split');
await vm.runInContext("exoChoosePath('C2')",C); ok(r.branch==='C2','C2');
await vm.runInContext("exoHostGrantL10('p1')",C); ok(r.level===10&&r.stage===5,'L10 granted');
a=vm.runInContext("exoArtHTML(exoGet('p1'),170,'x')",C); ok(/l10-c2-default-standard\.web\.jpg/.test(a),'L10 art');
await vm.runInContext("exoHostResetPath('p1')",C); ok(r.branch==='BASE','reset');
ok(/Choose your path/.test(vm.runInContext("exoPathPanelHTML(exoGet('p1'))",C)),'choose again');
console.log(pass+' passed, '+fail+' failed');})();
