// Parâmetros da Lua de Sangue. Um "dia" = uma expedição.
export const BLOODMOON = {
  /** a cada quantos dias vem uma Lua de Sangue */
  ciclo: 3,
  /** força da horda = base + porDia × dia */
  forcaBase: 160,
  forcaPorDia: 45,
  /** fração do dano que vaza pras estruturas internas quando as defesas caem */
  vazamento: 1,
  /** dano que basta pra danificar uma estrutura interna */
  danoPorEstrutura: 90,
  /** custo de reparo por 100 HP perdidos (defesas) */
  reparoPor100: { madeira: 3, sucata: 2, agua: 1 },
  /** custo base pra reparar estrutura interna danificada (× nível) */
  reparoInterno: { madeira: 4, agua: 2, sucata: 1 },
  /** defesas seguraram mas perderam essa fração da vida total: a horda leva material mesmo assim */
  danoPesado: 0.4,
  /** teto do que some nesse caso (a invasão de verdade leva até 40%) */
  rouboPesadoMax: 0.15,
  /** na expedição em noite de Lua de Sangue: zumbis enluarados e mais loot */
  lootMult: 1.5,
} as const;
