// monta jogo-cosmic.html: landing → (cadastro TODO) → criação → abrigo → expedições
const fs=require('fs'), path=require('path');
const D=path.join(__dirname,'..'), S=f=>fs.readFileSync(path.join(__dirname,f),'utf8');
const mods=['pix.js','baton.js','heroi.js','vigia.js','recruta_base.js','serralheiro.js','pedreira.js','lenhador.js','catadora.js','agricultor.js','capoeirista.js','enfermeira.js',
  'pet_core.js','pet_cachorro.js','pet_gato.js','pet_capivara.js','pet_jabuti.js','pet_papagaio.js','pet_sagui.js','cuspidor.js','gritador.js','barrigudo.js'];
if(fs.existsSync(path.join(__dirname,'abrigo.js'))) mods.push('abrigo.js');
const MODULES=mods.map(f=>'/* ===== '+f+' ===== */\n'+S(f)).join('\n');
const out=S('jogo-page.html').split('{{MODULES}}').join(MODULES);
fs.writeFileSync(path.join(D,'jogo-cosmic.html'),out);
fs.writeFileSync(path.join(D,'chk_jogo.js'),out.split('<script>').slice(1).map(x=>x.split('</script>')[0]).join('\n'));
console.log('jogo-cosmic.html',(out.length/1024).toFixed(0)+' KB','· abrigo.js:',mods.includes('abrigo.js')?'incluído':'fallback');
