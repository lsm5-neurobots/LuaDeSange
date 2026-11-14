// Recrutas resgatáveis e pets (arte em ART_HUB).
export type RecruitType = 'vigia' | 'serralheiro' | 'pedreira' | 'lenhador' | 'catadora' | 'agricultor' | 'capoeirista' | 'enfermeira';
export type PetType = 'cachorro' | 'gato' | 'capivara' | 'jabuti' | 'papagaio' | 'sagui';

/** `genero` segue a arte (art-src/hub: corpo f:1 = feminino) e o nome do tipo; decide a lista de nomes sorteada. */
export type Genero = 'm' | 'f';
export const RECRUITS: Record<RecruitType, { nome: string; papel: string; skins: string[]; bonus: string; genero: Genero }> = {
  vigia: { nome: 'Vigia', papel: 'Combate', skins: ['media', 'escura', 'clara'], bonus: 'Kit completo de beat \'em up: combo B, lançador, esquiva, apito.', genero: 'm' },
  serralheiro: { nome: 'Serralheiro', papel: 'Oficina', skins: ['media', 'escura', 'clara'], bonus: 'Armas fabricadas 15% mais baratas.', genero: 'm' },
  pedreira: { nome: 'Pedreira', papel: 'Construção', skins: ['media', 'escura', 'clara'], bonus: 'Reparos 25% mais baratos.', genero: 'f' },
  lenhador: { nome: 'Lenhador', papel: 'Coleta', skins: ['media', 'escura', 'clara'], bonus: '+20% madeira das expedições.', genero: 'm' },
  catadora: { nome: 'Catadora', papel: 'Coleta', skins: ['media', 'escura', 'clara'], bonus: '+20% sucata das expedições.', genero: 'f' },
  agricultor: { nome: 'Agricultor', papel: 'Produção', skins: ['media', 'escura', 'clara'], bonus: 'Horta produz +25%.', genero: 'm' },
  capoeirista: { nome: 'Capoeirista', papel: 'Combate', skins: ['media', 'escura', 'clara'], bonus: 'Esquiva mais (+10%).', genero: 'm' },
  enfermeira: { nome: 'Enfermeira', papel: 'Suporte', skins: ['media', 'escura', 'clara'], bonus: 'Cura o squad entre arenas (+50%).', genero: 'f' },
};

export const PETS: Record<PetType, { nome: string; apelido: string; bonus: string }> = {
  cachorro: { nome: 'Cachorro', apelido: 'Caramelo', bonus: '+10% dano do squad.' },
  gato: { nome: 'Gato', apelido: 'Pipoca', bonus: '+15% loot de vasculhar.' },
  capivara: { nome: 'Capivara', apelido: 'Mexerica', bonus: '+15% vida do squad.' },
  jabuti: { nome: 'Jabuti', apelido: 'Tião', bonus: '-10% dano recebido.' },
  papagaio: { nome: 'Papagaio', apelido: 'Louro', bonus: 'Avisa ataques: +10% esquiva.' },
  sagui: { nome: 'Sagui', apelido: 'Jaci', bonus: '+1 chave comum por expedição.' },
};

/** NOM-1: nomes e apelidos brasileiros (muitos nordestinos) por gênero. Sem termos de cor de pele nem ofensivos. */
export const NOMES_M = [
  'Edson', 'Bira', 'Zé', 'Toinho', 'Biu', 'Marcão', 'Chico', 'Tonho', 'Damião', 'Severino', 'Cícero', 'Raimundo', 'Joca', 'Tião',
  'Juca', 'Neném', 'Didi', 'Zezinho', 'Valdo', 'Gerson', 'Josué', 'Erivaldo', 'Genivaldo', 'Luizinho', 'Caio', 'Kauã', 'Ivan', 'Nonato',
];
export const NOMES_F = [
  'Iara', 'Socorro', 'Cida', 'Nena', 'Lia', 'Dida', 'Kel', 'Graça', 'Fátima', 'Rita', 'Dora', 'Zefa', 'Bia', 'Lurdinha', 'Toinha',
  'Conceição', 'Jaci', 'Raimunda', 'Mariinha', 'Nazaré', 'Francisca', 'Luzia', 'Cleide', 'Neide', 'Jussara', 'Dandara', 'Ana', 'Duda',
];
/** Apelidos de pet (o primeiro de cada tipo é o clássico, `PETS[t].apelido`). */
export const NOMES_PET = ['Caramelo', 'Pipoca', 'Mexerica', 'Tião', 'Louro', 'Jaci', 'Paçoca', 'Biscoito', 'Farofa', 'Cuscuz', 'Tapioca', 'Bolinha', 'Pirulito', 'Xodó', 'Fubá', 'Rapadura', 'Pitoco', 'Quindim'];
/** Lista de nomes do tipo de recruta (masculino ou feminino conforme o personagem). */
export const nomesDe = (t: RecruitType): string[] => (RECRUITS[t].genero === 'f' ? NOMES_F : NOMES_M);
