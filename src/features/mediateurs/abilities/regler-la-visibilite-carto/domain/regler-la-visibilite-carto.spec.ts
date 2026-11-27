import { describe, expect, it } from 'vitest'
import {
  AuteurId,
  MediateurId,
  UtilisateurId,
} from '@/features/mediateurs/domain'
import type { MediateurARegler } from './reglage-de-visibilite'
import { reglerLaVisibiliteCarto } from './regler-la-visibilite-carto'

const mediateurId = MediateurId('a1b2c3d4-0000-4000-8000-000000000001')
const auteurId = AuteurId('a1b2c3d4-0000-4000-8000-000000000002')
const maintenant = new Date('2026-06-01T10:00:00.000Z')

const mediateur: MediateurARegler = {
  id: mediateurId,
  utilisateurId: UtilisateurId('a1b2c3d4-0000-4000-8000-000000000003'),
}

const regler = (mediateurLu: MediateurARegler | null) =>
  reglerLaVisibiliteCarto({
    lireLeMediateur: async () => mediateurLu,
    enregistrer: async () => undefined,
  })({ mediateurId, visible: true, auteurId, maintenant })

describe('régler la visibilité sur la cartographie', () => {
  it('règle la visibilité d’un médiateur existant', async () => {
    expect(await regler(mediateur)).toEqual({
      success: true,
      data: { mediateur, visible: true, auteurId, regleLe: maintenant },
    })
  })

  it('signale un médiateur introuvable', async () => {
    expect(await regler(null)).toEqual({
      success: false,
      error: { _tag: 'MediateurIntrouvable', mediateurId },
    })
  })
})
