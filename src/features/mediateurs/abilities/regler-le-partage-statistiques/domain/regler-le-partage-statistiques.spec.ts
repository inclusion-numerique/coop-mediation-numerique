import { describe, expect, it } from 'vitest'
import {
  AuteurId,
  CoordinateurId,
  MediateurId,
  PerimetrePartage,
  type Rattachements,
} from '@/features/mediateurs/domain'
import { reglerLePartageStatistiques } from './regler-le-partage-statistiques'

const MEDIATEUR = MediateurId('1a2b3c4d-5e6f-4708-8192-a3b4c5d6e7f8')
const COORDINATEUR = CoordinateurId('2b3c4d5e-6f70-4819-92a3-b4c5d6e7f809')
const auteurId = AuteurId('3c4d5e6f-7081-4920-a3b4-c5d6e7f8091a')
const maintenant = new Date('2026-06-01T10:00:00.000Z')

const regler = (rattachements: Rattachements, perimetre: PerimetrePartage) =>
  reglerLePartageStatistiques({ enregistrer: async () => undefined })({
    rattachements,
    perimetre,
    actif: true,
    auteurId,
    maintenant,
  })

describe('régler le partage des statistiques', () => {
  it('partage les statistiques du rôle du périmètre choisi', async () => {
    expect(
      await regler(
        { mediateurId: MEDIATEUR, coordinateurId: COORDINATEUR },
        PerimetrePartage('Coordinateur'),
      ),
    ).toEqual({
      success: true,
      data: {
        proprietaire: { _tag: 'Coordinateur', coordinateurId: COORDINATEUR },
        actif: true,
        auteurId,
        regleLe: maintenant,
      },
    })
  })

  it('refuse un périmètre auquel le compte n’est pas rattaché', async () => {
    expect(
      await regler(
        { mediateurId: MEDIATEUR, coordinateurId: null },
        PerimetrePartage('Coordinateur'),
      ),
    ).toEqual({ success: false, error: { _tag: 'PerimetreNonRattache' } })
  })

  it('n’a rien à partager pour un compte sans rôle', async () => {
    expect(
      await regler(
        { mediateurId: null, coordinateurId: null },
        PerimetrePartage('Mediateur'),
      ),
    ).toEqual({ success: false, error: { _tag: 'AucuneStatistiqueAPartager' } })
  })
})
