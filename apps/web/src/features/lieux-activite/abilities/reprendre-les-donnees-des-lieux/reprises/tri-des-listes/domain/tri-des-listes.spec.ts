import { relever } from '../../../domain'
import { lieuAReprendre } from '../../../domain/lieu-a-reprendre.fixture'
import { triDesListes } from './tri-des-listes'

const DESORDONNES = [
  'Utilisation sécurisée du numérique',
  'Aide aux démarches administratives',
]

const sansEcrire = triDesListes(async () => undefined)

const mentionsDe = async (champs: Parameters<typeof lieuAReprendre>[0]) =>
  (await relever([sansEcrire], [lieuAReprendre(champs)])).lieux.flatMap(
    ({ constats }) => constats.flatMap(({ mentions }) => mentions),
  )

describe('le tri des listes, vu du relevé', () => {
  it('nomme la colonne et le geste comme motif', async () => {
    expect(await mentionsDe({ services: DESORDONNES })).toEqual([
      { colonne: 'services', cellule: 'à trier', motif: 'services : à trier' },
    ])
  })

  it('laisse hors du relevé un lieu dont les listes sont en ordre', async () => {
    expect(await mentionsDe({})).toEqual([])
  })

  it('confie au port le tri des seules colonnes désordonnées', async () => {
    const tries: { lieuId?: string; colonnes?: readonly string[] } = {}
    const reprise = triDesListes(async (lieuId, colonnes) => {
      tries.lieuId = lieuId
      tries.colonnes = colonnes
    })

    const releve = await relever(
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
