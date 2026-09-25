import { relever } from '../../../domain'
import { lieuAReprendre } from '../../../domain/lieu-a-reprendre.fixture'
import {
  complementAReprendre,
  repriseDuComplementDAdresse,
} from './reprise-du-complement-d-adresse'

const sansEcrire = repriseDuComplementDAdresse(async () => undefined)

const mentions = async (complementAdresse: string | null) =>
  (
    await relever([sansEcrire], [lieuAReprendre({ complementAdresse })])
  ).lieux.flatMap(({ constats }) =>
    constats.flatMap(({ mentions }) => mentions),
  )

const verdict = (complementAdresse: string | null) =>
  complementAReprendre(lieuAReprendre({ complementAdresse }))

describe('le complément d’adresse, nettoyé selon le standard', () => {
  it('ne concerne pas un lieu qui n’en porte pas', () => {
    expect(verdict(null)).toBeNull()
  })

  it('laisse en place un complément conforme', () => {
    expect(verdict('Bâtiment B, 2e étage')).toBeNull()
  })

  it('corrige les espaces en bord', () => {
    expect(verdict('2 RUE DU ROUERGUE ')).toEqual({
      verdict: 'a-corriger',
      corrige: '2 RUE DU ROUERGUE',
    })
  })

  it('corrige les guillemets droits', () => {
    expect(verdict('Groupe scolaire "Les Terrasses"')).toEqual({
      verdict: 'a-corriger',
      corrige: 'Groupe scolaire «\u00a0Les Terrasses\u00a0»',
    })
  })

  it.each([
    ['un SIRET', '21850033800015'],
    ['un téléphone', '06 02 16 12 33'],
    ['un code postal', '77250'],
    ['une chaîne vide', ''],
    ['du blanc', '   '],
  ])('efface %s', (_cas, complementAdresse) => {
    expect(verdict(complementAdresse)).toEqual({
      verdict: 'a-effacer',
      efface: complementAdresse,
    })
  })

  it('montre au relevé la valeur effacée, blancs compris', async () => {
    expect(await mentions(' ')).toEqual([
      {
        colonne: 'complementAdresse',
        cellule: '" "',
        motif: 'complementAdresse : à effacer',
      },
    ])
  })

  it('montre au relevé une chaîne vide effacée', async () => {
    expect((await mentions(''))[0]?.cellule).toBe('""')
  })
})
