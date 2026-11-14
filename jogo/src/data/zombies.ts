// Bestiário. Medidas (ax, G, top, w) estão em px da arte crua; o motor multiplica pela escala.
// Novo zumbi = entrada aqui + comportamento em expedition/ai/ + arte no pacote ART_EXP.
import type { Bag } from './resources';

export type ZombieId =
  | 'errante' | 'rastejante' | 'corredor' | 'cuspidor'
  | 'gritador' | 'barrigudo' | 'saltador' | 'estalador' | 'blindado'
  | 'brutamonte' | 'chorona' | 'acougueiro' | 'estivador' | 'meianoite'
  | 'ascensorista' | 'vendedorfitas' | 'erveira'
  | 'percussionista' | 'barqueiro'
  | 'malandro' | 'passista' | 'maquinista'
  | 'frevista' | 'baiana' | 'turista' | 'peixeiro' | 'acaizeiro' | 'seresteiro' | 'garcom' | 'grafiteiro' | 'seringueiro' | 'garimpeiro' | 'bugio' | 'piranha' | 'onca' | 'cobragrande' | 'peao' | 'tuiuiu' | 'queixada' | 'ariranha' | 'tamandua' | 'reijacare';

export interface ZombieDef {
  nome: string;
  /** chave da factory em ART_EXP; null = arte ainda não portada */
  art: 'ERR' | 'RAS' | 'COR' | 'CUSP' | 'GRIT' | 'BARR' | 'SALT' | 'BRUT' | 'ACOU' | 'CHORONA' | 'MEIANOITE' | 'ESTALADOR' | 'BLINDADO' | 'ESTIVADOR' | 'ASCENSORISTA' | 'VENDEDORFITAS' | 'ERVEIRA' | 'PERCUSSIONISTA' | 'BARQUEIRO' | 'MALANDRO' | 'PASSISTA' | 'MAQUINISTA' | 'FREVISTA' | 'BAIANA' | 'TURISTA' | 'PEIXEIRO' | 'ACAIZEIRO' | 'SERESTEIRO' | 'GARCOM' | 'GRAFITEIRO' | 'SERINGUEIRO' | 'GARIMPEIRO' | 'BUGIO' | 'PIRANHA' | 'ONCA' | 'COBRAGRANDE' | 'PEAO' | 'TUIUIU' | 'QUEIXADA' | 'ARIRANHA' | 'TAMANDUA' | 'REIJACARE' | null;
  ax: number; G: number; top: number; w: number;
  hp: number; dmg: number;
  boss?: 'mini' | 'chefe';
  /** id do comportamento em expedition/ai */
  ai: string;
  /** em que mapa aparece; 'futuro' = cadastrado, fora das ondas */
  /** mapas onde aparece (informativo; as ondas de cada mapa ficam em data/maps) */
  mapa: 'marco_zero' | 'olinda' | 'pelourinho' | 'veropeso' | 'lapa' | 'amazonia' | 'pantanal' | 'comum' | 'futuro';
  xp: number;
  /** chance de drop ao morrer */
  drop?: Bag;
  /** raridade de aparição por expedição (ausente = pela tabela RAR_PADRAO; chefes sempre vêm) */
  raridade?: Raridade;
  desc: string;
}

export type Raridade = 'comum' | 'incomum' | 'raro';
/** chance de cada tipo vir numa expedição (game/presenca.ts) */
export const RARIDADE: Record<Raridade, { nome: string; chance: number; cor: string }> = {
  comum: { nome: 'Comum', chance: 1, cor: '#c8c0d8' },
  incomum: { nome: 'Incomum', chance: 0.8, cor: '#5fd17a' },
  raro: { nome: 'Raro', chance: 0.55, cor: '#4fa3ff' },
};
/** errante/corredor/rastejante/cuspidor: base de todo mapa; variantes locais são raras; o resto é incomum */
const RAR_PADRAO: Partial<Record<string, Raridade>> = {
  errante: 'comum', corredor: 'comum', rastejante: 'comum', cuspidor: 'comum',
  percussionista: 'raro', barqueiro: 'raro', malandro: 'raro',
};
export const raridadeDe = (k: string): Raridade => (ZOMBIES as Record<string, ZombieDef>)[k]?.raridade ?? RAR_PADRAO[k] ?? 'incomum';

export const ZOMBIES: Record<ZombieId, ZombieDef> = {
  errante: { nome: 'Errante', art: 'ERR', ax: 74, G: 142, top: 106, w: 18, hp: 80, dmg: 14, ai: 'errante', mapa: 'marco_zero', xp: 4, drop: { sucata: 0.2 }, desc: 'Lento e teimoso. Vaga até te ver e morde de perto.' },
  rastejante: { nome: 'Rastejante', art: 'RAS', ax: 114, G: 96, top: 48, w: 40, hp: 55, dmg: 8, ai: 'rastejante', mapa: 'marco_zero', xp: 4, drop: { pano: 0.2 }, desc: 'Finge de morto no chão e agarra a perna: prende por 1 s.' },
  corredor: { nome: 'Corredor', art: 'COR', ax: 74, G: 142, top: 112, w: 14, hp: 45, dmg: 16, ai: 'corredor', mapa: 'marco_zero', xp: 5, drop: { comida: 0.2 }, desc: 'Investida rápida. Se errar, tropeça e fica aberto.' },
  cuspidor: { nome: 'Cuspidor', art: 'CUSP', ax: 88, G: 142, top: 114, w: 16, hp: 70, dmg: 6, ai: 'cuspidor', mapa: 'marco_zero', xp: 6, drop: { agua: 0.25 }, desc: 'Fica longe e cospe ácido que deixa poça venenosa.' },
  brutamonte: { nome: 'Brutamonte', art: 'BRUT', ax: 152, G: 286, top: 180, w: 56, hp: 1200, dmg: 30, boss: 'mini', ai: 'brutamonte', mapa: 'marco_zero', xp: 60, drop: { pecas: 1 }, desc: 'Mini boss. Investida em linha e arremesso de pedra. Bate na borda e fica atordoado.' },
  acougueiro: { nome: 'O Açougueiro', art: 'ACOU', ax: 168, G: 294, top: 209, w: 58, hp: 1400, dmg: 28, boss: 'chefe', ai: 'acougueiro', mapa: 'marco_zero', xp: 120, drop: { fragmento_lunar: 1 }, desc: 'Chefe do Marco Zero. Cutelada em área (vulnerável depois) e gancho que puxa.' },

  // ---- mapas futuros (arte e IA prontas ou pendentes; fora das ondas do MVP) ----
  gritador: { nome: 'Gritador', art: 'GRIT', ax: 82, G: 148, top: 110, w: 14, hp: 50, dmg: 0, ai: 'gritador', mapa: 'olinda', xp: 6, desc: 'Foge e grita chamando reforço.' },
  barrigudo: { nome: 'Barrigudo', art: 'BARR', ax: 98, G: 158, top: 110, w: 30, hp: 95, dmg: 10, ai: 'barrigudo', mapa: 'olinda', xp: 7, desc: 'Explode ao morrer, ferindo todo mundo perto.' },
  saltador: { nome: 'Saltador', art: 'SALT', ax: 84, G: 156, top: 104, w: 16, hp: 60, dmg: 12, ai: 'saltador', mapa: 'olinda', xp: 6, desc: 'Salto de 4 tiles com aviso no chão.' },
  estalador: { nome: 'Estalador', art: 'ESTALADOR', ax: 84, G: 148, top: 113, w: 14, hp: 70, dmg: 12, ai: 'estalador', mapa: 'pelourinho', xp: 6, drop: { pano: 0.2 }, desc: 'Cego; caça pelo som. Ignora quem anda devagar ou fica parado; correr, bater, atirar e vasculhar atraem. Agarrão forte.' },
  blindado: { nome: 'Blindado', art: 'BLINDADO', ax: 82, G: 150, top: 110, w: 22, hp: 160, dmg: 14, ai: 'blindado', mapa: 'veropeso', xp: 9, drop: { sucata: 0.3 }, desc: 'Tropa de choque com escudo: de frente bloqueia quase tudo. Bata por trás ou acerte 3 golpes no escudo até ele cair.' },
  // ---- variantes locais (medidas reais dos quadros: ax/G = âncora e chão; top = altura parada até o topo da cabeça/chapéu) ----
  percussionista: { nome: 'Zumbi Percussionista', art: 'PERCUSSIONISTA', ax: 80, G: 148, top: 110, w: 16, hp: 75, dmg: 10, ai: 'percussionista', mapa: 'pelourinho', xp: 7, drop: { pano: 0.25 }, desc: 'Variante local do Pelourinho. O golpe de tambor solta uma onda que empurra e atordoa; o ritmo acelera os zumbis perto dele. Mate primeiro: o ritmo acaba com ele.' },
  barqueiro: { nome: 'Zumbi Barqueiro', art: 'BARQUEIRO', ax: 88, G: 150, top: 110, w: 16, hp: 90, dmg: 14, ai: 'barqueiro', mapa: 'veropeso', xp: 8, drop: { madeira: 0.3 }, desc: 'Variante local do Ver-o-Peso. Remada de alcance longo, varrida que acerta a fila e rede que prende de longe. Deixa poças de lodo. Encoste nele: de perto o remo é lento.' },
  chorona: { nome: 'A Chorona', art: 'CHORONA', ax: 150, G: 240, top: 174, w: 30, hp: 2200, dmg: 24, boss: 'mini', ai: 'chorona', mapa: 'olinda', xp: 80, drop: { pecas: 2 }, desc: 'Mini boss de Olinda. Grito que atordoa, avanço fantasma, arranhão e chama mortos do chão.' },
  meianoite: { nome: 'Boneco da Meia-Noite', art: 'MEIANOITE', ax: 232, G: 322, top: 268, w: 60, hp: 3600, dmg: 32, boss: 'chefe', ai: 'meianoite', mapa: 'olinda', xp: 200, drop: { fragmento_lunar: 2 }, desc: 'Chefe de Olinda. Boneco gigante tomado pela Lua: pisão em área, giro de braços de pano e badaladas.' },
  // ---- chefes dos mapas novos (medidas reais dos quadros: ax/G = âncora e chão; top = altura parada; escala acima do Meia-Noite) ----
  vendedorfitas: { nome: 'O Vendedor de Fitas', art: 'VENDEDORFITAS', ax: 160, G: 250, top: 181, w: 28, hp: 2600, dmg: 26, boss: 'mini', ai: 'vendedorfitas', mapa: 'pelourinho', xp: 95, drop: { pecas: 2 }, desc: 'Mini boss do Pelourinho. Laço de fitas que prende, chicote em arco, chuva de fitas que deixa o chão lento e corrida na fúria.' },
  ascensorista: { nome: 'O Ascensorista', art: 'ASCENSORISTA', ax: 226, G: 326, top: 255, w: 46, hp: 4600, dmg: 34, boss: 'chefe', ai: 'ascensorista', mapa: 'pelourinho', xp: 260, drop: { fragmento_lunar: 2 }, desc: 'Chefe do Pelourinho. Cabines que caem do alto, porta pantográfica que prende, descida sem freio (vulnerável depois) e pane que apaga as luzes.' },
  erveira: { nome: 'A Erveira', art: 'ERVEIRA', ax: 156, G: 240, top: 171, w: 32, hp: 3000, dmg: 28, boss: 'mini', ai: 'erveira', mapa: 'veropeso', xp: 110, drop: { pecas: 2 }, desc: 'Mini boss do Ver-o-Peso. Garrafada com poça de veneno, raízes que prendem, chá que cura (interrompa!) e cajado; chama mortos do mato.' },
  estivador: { nome: 'O Estivador', art: 'ESTIVADOR', ax: 236, G: 328, top: 260, w: 58, hp: 5600, dmg: 36, boss: 'chefe', ai: 'estivador', mapa: 'veropeso', xp: 320, drop: { fragmento_lunar: 3 }, desc: 'Chefe do Ver-o-Peso. Gancho de carga que puxa até 4 tiles, caixotes que ficam no chão como obstáculo (quebre-os), varredura e guindaste (vulnerável depois).' },
  // Lapa · Rio de Janeiro (medidas/números provisórios: os agentes de arte/IA ajustam a própria linha)
  malandro: { nome: 'Zumbi Malandro', art: 'MALANDRO', ax: 80, G: 150, top: 122, w: 16, hp: 95, dmg: 14, ai: 'malandro', mapa: 'lapa', xp: 9, drop: { pano: 0.3 }, desc: 'Variante local da Lapa. Terno de linho branco, panamá e navalha. Ginga pra esquivar golpes de frente (de costas não esquiva), navalhada em sequência, chapéu que vai e volta e rasteira que derruba. Depois da rasteira fica aberto ajeitando o terno: é a hora de bater.' },
  passista: { nome: 'A Passista', art: 'PASSISTA', ax: 170, G: 242, top: 191, w: 28, hp: 3400, dmg: 28, boss: 'mini', ai: 'passista', mapa: 'lapa', xp: 130, drop: { pecas: 3 }, desc: 'Mini boss da Lapa, no Circo Voador. Destaque de escola de samba com esplendor de plumas: giro de plumas que empurra (depois fica TONTA: bata!), pisão de salto com aviso, chuva de lantejoulas que ofusca e deixa o chão lento, avanço sambando. Na fúria as plumas pegam chama lunar e ela chama a ala de Malandros.' },
  maquinista: { nome: 'O Maquinista do Bonde', art: 'MAQUINISTA', ax: 232, G: 356, top: 240, w: 52, hp: 6600, dmg: 38, boss: 'chefe', ai: 'maquinista', mapa: 'lapa', xp: 380, drop: { fragmento_lunar: 3 }, desc: 'Chefe da Lapa, nos Arcos. Motorneiro do bonde de Santa Teresa: bonde sem freio que atravessa a arena numa faixa avisada (depois recarrega a manivela, vulnerável), vara do trole com arco elétrico, faíscas da catenária e o sino que atordoa. Na fúria o bonde passa duas vezes.' },
  frevista: { nome: 'Zumbi Frevista', art: 'FREVISTA', ax: 98, G: 172, top: 108, w: 16, hp: 65, dmg: 11, ai: 'frevista', mapa: 'olinda', xp: 7, drop: { pano: 0.25 }, desc: 'Passista de frevo de Olinda preso na folia. Avança em zigue-zague e gira a sombrinha, que rebate tiros de frente; laser, golpe por trás e corpo a corpo passam. Depois do passo de tesoura ele fica de costas ajeitando o chapéu: é a hora de bater.' },
  baiana: { nome: 'Zumbi Baiana do Acarajé', art: 'BAIANA', ax: 92, G: 154, top: 125, w: 22, hp: 100, dmg: 12, ai: 'baiana', mapa: 'pelourinho', xp: 8, drop: { comida: 0.3 }, desc: 'Baiana do acarajé tomada pela Lua de Sangue: defende o ponto com o tabuleiro e arremessa dendê fervendo que deixa poça que queima. Depois de jogar a panela, fica um instante reabastecendo e aberta.' },
  turista: { nome: 'Zumbi Turista', art: 'TURISTA', ax: 80, G: 150, top: 118, w: 14, hp: 55, dmg: 8, ai: 'turista', mapa: 'pelourinho', xp: 7, drop: { sucata: 0.25 }, raridade: 'raro', desc: 'Visitante do Pelourinho preso no instante da foto. Cega com o flash quem olha de frente e foge de quem chega perto; quando para pra fotografar fica vulnerável, e um golpe por trás quebra a pose.' },
  peixeiro: { nome: 'Zumbi Peixeiro', art: 'PEIXEIRO', ax: 84, G: 152, top: 112, w: 20, hp: 105, dmg: 15, ai: 'peixeiro', mapa: 'veropeso', xp: 9, drop: { comida: 0.3 }, desc: 'Peixeiro do Ver-o-Peso: facão em duas, golpe de cima e peixe arremessado em linha, que deixa poça escorregadia. Saia da faixa para desviar; depois do arremesso ele abre o isopor e fica aberto (+25% de dano).' },
  acaizeiro: { nome: 'Zumbi Açaizeiro', art: 'ACAIZEIRO', ax: 96, G: 158, top: 116, w: 26, hp: 120, dmg: 12, ai: 'acaizeiro', mapa: 'veropeso', xp: 9, drop: { madeira: 0.3 }, desc: 'Carregador do Ver-o-Peso curvado sob o paneiro de açaí. Derruba com a rasteira e prende os pés na poça roxa; o paneiro protege as costas, mas depois da rasteira ele fica de joelho, aberto.' },
  seresteiro: { nome: 'Zumbi Seresteiro', art: 'SERESTEIRO', ax: 80, G: 150, top: 124, w: 18, hp: 85, dmg: 10, ai: 'seresteiro', mapa: 'lapa', xp: 10, drop: { pano: 0.25 }, raridade: 'raro', desc: 'Cantor de serenata da Lapa, de boina e paletó curto, curvado sobre o violão. A serenata adormece quem está no círculo em volta dele; saia do círculo ou acerte um golpe forte enquanto ele inala. Acuado, quebra o violão e fica sem ele por um tempo, só com socos.' },
  garcom: { nome: 'Zumbi Garçom', art: 'GARCOM', ax: 80, G: 150, top: 112, w: 16, hp: 80, dmg: 13, ai: 'garcom', mapa: 'lapa', xp: 10, drop: { sucata: 0.3 }, desc: 'Garçom de boteco da Lapa que serve a morte: arremessa tulipas de chope em leque e gira com a bandeja para escapar de golpes de frente. Depois do leque fica com a bandeja vazia, e de costas não gira. Quebre a bandeja e ele fica só na garrafada.' },
  grafiteiro: { nome: 'Zumbi Grafiteiro', art: 'GRAFITEIRO', ax: 80, G: 150, top: 111, w: 16, hp: 75, dmg: 9, ai: 'grafiteiro', mapa: 'lapa', xp: 10, drop: { sucata: 0.25 }, raridade: 'raro', desc: 'Artista de rua da Lapa, de capuz, máscara e lata de spray. A nuvem de spray cega quem olha de frente e o glifo pintado no chão puxa os outros zumbis. Ajoelhado pintando leva mais dano; apague o glifo ou derrube a lata acertando ele durante a nuvem.' },
  seringueiro: { nome: 'Zumbi Seringueiro', art: 'SERINGUEIRO', ax: 80, G: 150, top: 122, w: 16, hp: 110, dmg: 16, ai: 'seringueiro', mapa: 'amazonia', xp: 10, drop: { pano: 0.35 }, desc: 'Seringueiro do ciclo da borracha com a lamparina ainda acesa na testa. Joga látex que gruda e deixa o chão lento, e termina no facão; depois do jato fica sem balde e abaixa pra encher, aberto.' },
  garimpeiro: { nome: 'Zumbi Garimpeiro', art: 'GARIMPEIRO', ax: 84, G: 154, top: 121, w: 20, hp: 135, dmg: 17, ai: 'garimpeiro', mapa: 'amazonia', xp: 10, drop: { sucata: 0.35 }, desc: 'Garimpeiro coberto de lama, com picareta e bateia de mercúrio. Racha o chão na picaretada, joga lama de mercúrio que envenena e ofusca, e cava pra surgir embaixo do squad: saia do círculo de terra. Ao surgir fica preso puxando a picareta, que é a hora de bater.' },
  bugio: { nome: 'Bugio Zumbi', art: 'BUGIO', ax: 128, G: 204, top: 110, w: 22, hp: 70, dmg: 13, ai: 'bugio', mapa: 'amazonia', xp: 8, drop: { comida: 0.25 }, desc: 'Guariba-vermelho da Amazônia. Desce das árvores em salto (fuja da sombra), arremessa fruto podre que ofusca e urra chamando o bando, o que acelera os zumbis perto. Bata durante o urro: leva mais dano e o urro é cancelado.' },
  piranha: { nome: 'Cardume de Piranhas', art: 'PIRANHA', ax: 128, G: 120, top: 52, w: 56, hp: 75, dmg: 7, ai: 'piranha', mapa: 'amazonia', xp: 9, drop: { comida: 0.3 }, desc: 'Cardume de piranhas-vermelhas que nada na lama e na água rasa: mordidas rápidas que fazem sangrar (acumula até 3) e salto fora da água. Fora da poça ficam encalhadas e levam dano dobrado; ataque em área dizima o cardume.' },
  onca: { nome: 'A Onça-Pintada', art: 'ONCA', ax: 190, G: 222, top: 110, w: 36, hp: 4200, dmg: 32, boss: 'mini', ai: 'onca', mapa: 'amazonia', xp: 160, drop: { pecas: 3, pano: 2 }, desc: 'Mini boss da Amazônia, na samaúma. Some no mato e reaparece onde estão os olhos brilhando, armando um bote longo (cauda chicoteia: saia da faixa!). Se errar, fica ATOLADA: bata! Patada em arco e rugido que atordoa e chama Bugios. Na fúria: olhos falsos e bote duplo.' },
  cobragrande: { nome: 'A Cobra-Grande', art: 'COBRAGRANDE', ax: 268, G: 408, top: 270, w: 70, hp: 7800, dmg: 42, boss: 'chefe', ai: 'cobragrande', mapa: 'amazonia', xp: 460, drop: { fragmento_lunar: 4 }, desc: 'Chefe da Amazônia, na várzea. A sucuri gigante da lenda ribeirinha sobe do remanso: bote que atola a cabeça se errar, constrição que prende um lutador (os aliados soltam batendo no corpo), cauda varrendo e mergulho com ataque por baixo. Na fúria os olhos viram duas luas.' },
  peao: { nome: 'Zumbi Peão Pantaneiro', art: 'PEAO', ax: 82, G: 152, top: 116, w: 16, hp: 110, dmg: 15, ai: 'peao', mapa: 'pantanal', xp: 10, drop: { pano: 0.3 }, desc: 'Peão de comitiva que continua tocando a boiada depois de morto. De longe laça e puxa o lutador; com o rebanho por perto sopra o berrante e enfurece os zumbis. Logo depois de soprar fica com as mãos ocupadas: é a hora de bater.' },
  tuiuiu: { nome: 'Tuiuiú Zumbi', art: 'TUIUIU', ax: 100, G: 166, top: 114, w: 18, hp: 70, dmg: 14, ai: 'tuiuiu', mapa: 'pantanal', xp: 9, drop: { pano: 0.25 }, raridade: 'raro', desc: 'A ave-símbolo do Pantanal, levantada com a lua no olho. Dá bicada longa que perfura e sangra e voo rasante em que fica imune a golpes de solo; ao pousar fica esparramado e vulnerável, e a cabeça leva mais dano de tiro.' },
  queixada: { nome: 'Queixada Zumbi', art: 'QUEIXADA', ax: 100, G: 130, top: 72, w: 30, hp: 90, dmg: 12, ai: 'queixada', mapa: 'pantanal', xp: 8, drop: { comida: 0.3 }, desc: 'Porco-do-mato do Pantanal que voltou da Lua de Sangue com o bando. Sozinho é fraco, mas o bando investe junto na mesma linha e derruba quem estiver no caminho.' },
  ariranha: { nome: 'Ariranha Zumbi', art: 'ARIRANHA', ax: 112, G: 156, top: 52, w: 32, hp: 65, dmg: 9, ai: 'ariranha', mapa: 'pantanal', xp: 9, drop: { comida: 0.25 }, desc: 'Lontra gigante do Pantanal que voltou da Lua de Sangue com a família: sai da água em periscópio, morde em rajada e guincha chamando o bando. Em área alagada mergulha e reaparece nas suas costas.' },
  tamandua: { nome: 'O Tamanduá-Bandeira', art: 'TAMANDUA', ax: 178, G: 270, top: 130, w: 36, hp: 4600, dmg: 32, ai: 'tamandua', mapa: 'pantanal', xp: 160, boss: 'mini', drop: { pecas: 3 }, desc: 'Mini boss do Pantanal: o tamanduá-bandeira gigante, com cupinzeiro roxo crescendo no dorso. Ergue-se nas patas de trás e prende quem estiver perto num abraço de garras; de longe, puxa com a língua. Quando solta o abraço fica tonto e aberto: é a hora de bater.' },
  reijacare: { nome: 'O Rei Jacaré', art: 'REIJACARE', ax: 258, G: 312, top: 150, w: 84, hp: 9200, dmg: 44, boss: 'chefe', ai: 'reijacare', mapa: 'pantanal', xp: 520, drop: { fragmento_lunar: 3 }, desc: 'Chefe do Pantanal: um jacaré de 80 anos coroado de aguapé pela Lua de Sangue. Mordida avisada, giro da morte que prende e gira o lutador (os outros batem nele para soltar), rabada em área e mergulho para emergir em outro ponto chamando as piranhas. Depois de emergir fica zonzo: é a hora do dano.' },
};
