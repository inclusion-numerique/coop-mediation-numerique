import { lieuAReprendre } from './lieu-a-reprendre.fixture'
import { comptesParMotif, relever } from './releve'
import { type Reprise, reprise } from './reprise'

const repriseDeTest = (
  colonne: string,
  concerne: (nom: string) => boolean,
): Reprise =>
  reprise<string>({
    colonnes: [colonne],
    constater: (lieu) => (concerne(lieu.nom) ? lieu.nom : null),
    mentions: () => [
      { colonne, cellule: 'à faire', motif: `${colonne} : à faire` },
    ],
    appliquer: async () => undefined,
  })

const TOUJOURS = repriseDeTest('premiere', () => true)

const JAMAIS = repriseDeTest('seconde', () => false)

const SUR_REIMS = repriseDeTest('seconde', (nom) => nom.includes('Reims'))

describe('le relevé', () => {
  it('annonce les colonnes de toutes les reprises, même celles qui ne relèvent rien', async () => {
    expect((await relever([TOUJOURS, JAMAIS], [])).colonnes).toEqual([
      'premiere',
      'seconde',
    ])
  })

  it('ne retient que les lieux qu’au moins une reprise concerne', async () => {
    const releve = await relever(
      [SUR_REIMS],
      [
        lieuAReprendre({ id: 'a', nom: 'Espace de Reims' }),
        lieuAReprendre({ id: 'b', nom: 'Espace de Lyon' }),
      ],
    )

    expect(releve.lieuxMesures).toBe(2)
    expect(releve.lieux.map(({ lieuId }) => lieuId)).toEqual(['a'])
  })

  it('rassemble sur un lieu les constats de chaque reprise', async () => {
    const releve = await relever(
      [TOUJOURS, SUR_REIMS],
      [lieuAReprendre({ nom: 'Espace de Reims' })],
    )

    expect(releve.lieux.flatMap(({ constats }) => constats)).toHaveLength(2)
  })

  it('compte les lieux motif par motif, du plus lourd au plus léger', async () => {
    const releve = await relever(
      [TOUJOURS, SUR_REIMS],
      [
        lieuAReprendre({ id: 'a', nom: 'Espace de Reims' }),
        lieuAReprendre({ id: 'b', nom: 'Espace de Lyon' }),
      ],
    )

    expect(comptesParMotif(releve)).toEqual([
      { motif: 'premiere : à faire', lieux: 2 },
      { motif: 'seconde : à faire', lieux: 1 },
    ])
  })

  it('porte de quoi reconnaître le lieu', async () => {
    const [lieu] = (await relever([TOUJOURS], [lieuAReprendre()])).lieux

    expect(lieu?.nom).toBe('Espace numérique de Reims')
    expect(lieu?.commune).toBe('Reims')
    expect(lieu?.codePostal).toBe('51100')
    expect(lieu?.publie).toBe(true)
  })
})
