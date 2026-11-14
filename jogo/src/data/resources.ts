// Recursos do abrigo.
export type ResId = 'madeira' | 'sucata' | 'pano' | 'agua' | 'comida' | 'remedio' | 'pecas' | 'gasolina' | 'fragmento_lunar';
export type Bag = Partial<Record<ResId, number>>;

export const RESOURCES: Record<ResId, { nome: string; cor: string }> = {
  madeira: { nome: 'Madeira', cor: '#a8743a' },
  sucata: { nome: 'Sucata', cor: '#8a8a96' },
  pano: { nome: 'Pano', cor: '#e8dcc0' },
  agua: { nome: 'Água', cor: '#3a8ad8' },
  comida: { nome: 'Comida', cor: '#6fdc7a' },
  remedio: { nome: 'Remédio', cor: '#ff6a8a' },
  pecas: { nome: 'Peças', cor: '#3ed4ff' },
  gasolina: { nome: 'Gasolina', cor: '#e8b830' },
  fragmento_lunar: { nome: 'Fragmento lunar', cor: '#c8323a' },
};

export const RES_IDS = Object.keys(RESOURCES) as ResId[];
/** Recursos sempre visíveis no HUD (os outros aparecem quando > 0). */
export const RES_HUD: ResId[] = ['madeira', 'sucata', 'agua', 'comida', 'pano', 'remedio'];

/** Itens que caem de objetos/baús na expedição → recurso do abrigo. */
export const LOOT_TO_RES: Record<string, ResId> = {
  sucata: 'sucata', comida: 'comida', moedas: 'sucata', madeira: 'madeira', pano: 'pano', remedio: 'remedio', remédio: 'remedio',
  agua: 'agua', água: 'agua', pecas: 'pecas', peças: 'pecas', gasolina: 'gasolina', bateria: 'pecas', fios: 'pecas', ferramenta: 'pecas',
  atadura: 'remedio', bandagem: 'remedio', lata: 'comida', enlatado: 'comida', garrafa: 'agua', roupa: 'pano', tecido: 'pano',
  // Ver-o-Peso: açaí e peixe curam como comida até haver recurso próprio; ervas viram remédio; corda e rede, pano
  açaí: 'comida', acai: 'comida', peixe: 'comida', ervas: 'remedio', corda: 'pano', rede: 'pano',
};
