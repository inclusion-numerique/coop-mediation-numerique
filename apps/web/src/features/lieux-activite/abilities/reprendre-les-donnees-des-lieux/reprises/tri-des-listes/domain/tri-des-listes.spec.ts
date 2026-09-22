import { relever } from '../../../domain'
import { lieuAReprendre } from '../../../domain/lieu-a-reprendre.fixture'
import { triDesListes } from './tri-des-listes'

const DESORDONNES = [
  'Utilisation sécurisée du numérique',
  'Aide aux démarches administratives',
]

const sansEcrire = triDesListes(async () => undefined)

describe('le tri des listes, vu du relevé', () => {
  it('nomme la colonne et le geste comme motif', () => {
    const releve = relever(
      [sansEcrire],
      [lieuAReprendre({ services: DESORDONNES })],
    )

    expect(
      releve.lieux.flatMap(({ constats }) =>
        constats.flatMap(({ mentions }) => mentions),
      ),
    ).toEqual([
      { colonne: 'services', cellule: 'à trier', motif: 'services : à trier' },
    ])
  })

  it('laisse hors du relevé un lieu dont les listes sont en ordre', () => {
    expect(relever([sansEcrire], [lieuAReprendre()]).lieux).toEqual([])
  })

  it('confie au port le tri des seules colonnes désordonnées', async () => {
    const tries: { lieuId?: string; colonnes?: readonly string[] } = {}
    const reprise = triDesListes(async (lieuId, colonnes) => {
      tries.lieuId = lieuId
      tries.colonnes = colonnes
    })

    const releve = relever(
      [reprise],
      [lieuAReprendre({ id: 'a', services: DESORDONNES })],
    )

    await Promise.all(
      releve.lieux.flatMap(({ constats }) =>
        constats.map(({ appliquer }) => appliquer()),
      ),
    )

    expect(tries).toEqual({ lieuId: 'a', colonnes: ['services'] })
  })
})
