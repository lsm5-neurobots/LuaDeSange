// node build_pet.js <id>  → gera src/pet_<id>-page.html e pet_<id>-cosmic.html
const fs=require('fs'), path=require('path');
const D=path.join(__dirname,'..'), S=f=>fs.readFileSync(path.join(__dirname,f),'utf8'), A=f=>fs.readFileSync(path.join(D,f),'utf8');
const script=h=>h.split('<script>')[1].split('</script>')[0];
const err=A('errante-cosmic.html'), es=script(err);
const CSS=err.match(/<style>[\s\S]*?<\/style>/)[0];
const BG=es.slice(es.indexOf('/* ---------- stage background'),es.indexOf('/* ---------- state & loop'));
const TXT={
 cachorro:{NOME:'Cachorro',SUB:'Vira-lata caramelo',VAR:'PET_CACHORRO',
  LEDE:'Vira-lata caramelo leal e destemido que sobreviveu às ruas antes mesmo da Lua de Sangue: orelhas semicaídas, focinho creme, língua de fora e rabo sempre abanando. Usa uma bandana vermelha surrada com plaquinha de metal. <b>Especial: Latido de Alerta</b>, que late ao menor sinal de zumbi e avisa o squad.',
  NOTE:'No Latido de alerta, o quadro 1 mostra as orelhas subindo com "!", o 3 é o primeiro "AU!" e o 4 é o segundo latido, mais forte, com a pata levantada. As ondas saem da boca. Na Mordida, o quadro 2 segura a antecipação por 200 ms e o bote dura só 70 ms.',
  ROWS:[['Cabeça e olhos','Crânio oval caramelo, olho de perfil com brilho e a "sobrancelha" creme que vira sobrancelha brava no ataque. Olho fechado no dano, espiral no tonteio e X no desmaio.'],['Orelhas','Triangulares e semicaídas, com a ponta dobrada pra frente. Ficam em pé no latido e na mordida.'],['Focinho e boca','Focinho creme comprido com trufa preta. A mandíbula é peça separada e abre até 32°, com a língua rosa de fora no parado e no trote.'],['Corpo e patas','3 elipses (garupa, barriga, peito) com barriga creme e faixa dorsal escura. As patas de lá são mais escuras e as daqui têm meias creme. Trote com pares diagonais.'],['Rabo','5 segmentos em foice com ponta creme. Abana no parado, sobe no latido e cai entre as patas no dano.'],['Bandana','Triângulo vermelho com pontos de desgaste e plaquinha de metal pendurada.'],['Pelagens','Caramelo (ficha), malhado preto e branco, e pretinho com pés caramelo.']]},
 gato:{NOME:'Gato',SUB:'De telhado',VAR:'PET_GATO',
  LEDE:'Tabby cinza de rua, magro e esperto, que sobreviveu pulando de telhado em telhado. Anda à frente do herói com o rabo em gancho, tem orelha rasgada e usa bandana vermelha com plaquinha de lata. <b>Especial: Sumiço de Telhado</b>: some numa fumacinha e reaparece mais adiante, como quem conhece todos os atalhos.',
  NOTE:'No Sumiço, o quadro 1 é a piscadela, no 2 a fumaça cobre o gato, no 3 ele some de vez, no 4 aparece o fantasma com brilhos 46 px à frente e no 5 ele reaparece. Na Patada, a antecipação de 220 ms sobe a pata com as garras de fora antes do arranhão.',
  ROWS:[['Cabeça','Redonda com bochecha larga, o "M" tabby na testa, listras na bochecha e focinho creme com nariz rosa. Boca em "w" e sibilo com caninos no ataque.'],['Olhos','Verde-limão com pupila em fenda. Traço na piscada, "^" no especial e X no desmaio.'],['Orelhas','Altas e pontudas. A da frente tem interior rosa e rasgo na ponta. Giram pra trás quando ele fica bravo ou assustado.'],['Corpo e patas','Tronco alongado com 5 listras escuras, meias creme nas patas da frente e garras brancas na patada.'],['Rabo','7 segmentos com anéis escuros, em ponto de interrogação. Fica eriçado na antecipação e esticado no chão no desmaio.'],['Bandana','Vermelho-sangue com bolinhas, nó atrás com pontas soltas e plaquinha redonda de lata.'],['Pelagens','Tabby cinza (ficha), laranja e preto de olho amarelo.']]},
 capivara:{NOME:'Capivara',SUB:'Calma demais',VAR:'PET_CAPIVARA',
  LEDE:'A capivara é calma demais pro apocalipse: anda num gingado lento de olhos meio fechados, e nem os zumbis comuns se dão ao trabalho de atacar. Corpo de barril, cabeça quadradona, uma mexerica equilibrada no cocuruto e uma bolsinha de primeiros socorros a tiracolo. <b>Especial: Aura da Calmaria</b>, que cura o herói só de ficar por perto.',
  NOTE:'Na Aura, um anel verde cresce no chão por 1,3 s com cruzinhas e corações subindo. A Cabeçada tem 280 ms de antecipação, com a cabeça baixa e a mexerica quase caindo. No desmaio, a mexerica voa e cai no chão.',
  ROWS:[['Cabeça','Bloco quadradão com topo reto e frente cortada, focinho largo mais escuro, narina horizontal e bigodinho.'],['Olhos','Pequenos e no alto, com a pálpebra de pelo cobrindo metade: o olhar "tô de boa". Viram traço sereno na aura e X no desmaio.'],['Orelhas','Redondinhas no topo de trás, com um tique no parado.'],['Corpo','Barril de 3 elipses com anca alta e redonda, sem rabo, barriga mais clara e tufos ásperos no dorso.'],['Patas','Curtas e grossas, com patas quase pretas. Gingado lento de pares diagonais.'],['Mexerica','Laranja com folhinha. Balança no gingado, quase cai na cabeçada e voa no desmaio.'],['Bolsinha','Lona verde-oliva com aba, etiqueta com cruz vermelha e alça de couro cruzando o corpo.'],['Pelagens','Marrom (ficha), ruiva e escura.']]},
};
function build(id){
  const t=TXT[id];
  const rows=t.ROWS.map(r=>`<tr><td>${r[0]}</td><td>${r[1]}</td></tr>`).join('');
  const page=S('pet_page_tpl.html').split('{{NOME}}').join(t.NOME).split('{{SUB}}').join(t.SUB).split('{{LEDE}}').join(t.LEDE).split('{{NOTE}}').join(t.NOTE).split('{{ROWS}}').join(rows).split('{{PETVAR}}').join(t.VAR);
  fs.writeFileSync(path.join(__dirname,'pet_'+id+'-page.html'),page);
  const png=fs.readFileSync('C:/Users/lucas/Desktop/CerebroNB/LuadeSangue/Pets da Lua de Sangue/sprites/'+id+'.png').toString('base64');
  const fill={CSS,BG,PIX:S('pix.js'),BATON:S('baton.js'),VIGIA:S('vigia.js'),CORE:S('pet_core.js'),PETJS:S('pet_'+id+'.js'),OLDPNG:png};
  const out=Object.entries(fill).reduce((s,[k,v])=>s.split('{{'+k+'}}').join(v),page);
  fs.writeFileSync(path.join(D,'pet_'+id+'-cosmic.html'),out);
  console.log('pet_'+id+'-cosmic.html',(out.length/1024|0)+' KB');
}
module.exports=build;
if(require.main===module) (process.argv.slice(2).length?process.argv.slice(2):Object.keys(TXT)).forEach(build);
