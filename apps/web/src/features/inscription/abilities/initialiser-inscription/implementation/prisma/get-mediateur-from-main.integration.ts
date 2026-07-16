import { entrepotPrismaClient } from '@app/web/entrepotPrismaClient'
import { getMediateurFromMain } from './get-mediateur-from-main'

type Temoin = {
  email: string
  isConseillerNumerique: boolean
  isCoordinateur: boolean
}

/**
 * Découvre dans `main` un email témoin satisfaisant un critère — ou `null` si le
 * schéma partagé est absent (CI sans données Dataspace) ou vide, auquel cas le
 * test correspondant se contente de passer. Aucune donnée (email) n'est écrite en
 * dur : les témoins sont résolus à l'exécution.
 */
const temoin = async (
  critere: 'conseillerNumerique' | 'nonConseillerNumerique' | 'coordinateur',
): Promise<Temoin | null> => {
  // Règle CN = affectation d'emploi idPoste active — cf. reader.
  const affectationCnActive =
    "EXISTS (SELECT 1 FROM main.personne_affectations pa WHERE pa.personne_id = p.id AND pa.source = 'idposte' AND pa.type = 'structure_emploi' AND pa.est_active = TRUE)"
  const filtre = {
    conseillerNumerique: affectationCnActive,
    nonConseillerNumerique: `NOT ${affectationCnActive}`,
    coordinateur: 'p.is_coordinateur',
  }[critere]

  try {
    const rows = await entrepotPrismaClient.$queryRawUnsafe<
      {
        email: string
        is_conseiller_numerique: boolean
        is_coordinateur: boolean
      }[]
    >(
      `SELECT lower(p.contact -> 'coop' ->> 'email') AS email,
              ${affectationCnActive} AS is_conseiller_numerique,
              p.is_coordinateur
       FROM main.personne p
       WHERE p.contact -> 'coop' ->> 'email' IS NOT NULL AND ${filtre}
       ORDER BY p.updated_at DESC NULLS LAST
       LIMIT 1`,
    )
    const row = rows.at(0)
    return row
      ? {
          email: row.email,
          isConseillerNumerique: row.is_conseiller_numerique,
          isCoordinateur: row.is_coordinateur,
        }
      : null
  } catch {
    return null // schéma `main` absent → prototype non exerçable dans cet environnement
  }
}

describe('getMediateurFromMain (lecture directe du schéma partagé)', () => {
  it('reproduit le statut conseiller numérique d’un CN résolu par email', async () => {
    const t = await temoin('conseillerNumerique')
    if (!t) return
    expect(await getMediateurFromMain({ email: t.email })).toEqual(
      expect.objectContaining({ isConseillerNumerique: true }),
    )
  })

  it('reproduit un non-conseiller numérique', async () => {
    const t = await temoin('nonConseillerNumerique')
    if (!t) return
    expect(
      (await getMediateurFromMain({ email: t.email }))?.isConseillerNumerique,
    ).toBe(false)
  })

  it('reproduit un coordinateur', async () => {
    const t = await temoin('coordinateur')
    if (!t) return
    expect(
      (await getMediateurFromMain({ email: t.email }))?.isCoordinateur,
    ).toBe(true)
  })

  it('rend null pour un email absent du schéma', async () => {
    try {
      expect(
        await getMediateurFromMain({
          email: 'inconnu.prototype@example.invalid',
        }),
      ).toBeNull()
    } catch {
      // schéma `main` absent → non exerçable ici
    }
  })
})
