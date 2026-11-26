import { describe, expect, it } from 'vitest'
import {
  CoordinateurId,
  MediateurId,
  type Rattachements,
} from '@/features/mediateurs/domain'
import { revoquerPartageStatistiques } from './revoquer-partage-statistiques'

const MEDIATEUR = MediateurId('1a2b3c4d-5e6f-4708-8192-a3b4c5d6e7f8')
const COORDINATEUR = CoordinateurId('2b3c4d5e-6f70-4819-92a3-b4c5d6e7f809')
const maintenant = new Date('2026-06-01T10:00:00.000Z')

const revoquer = (rattachements: Rattachements) =>
  revoquerPartageStatistiques({
    revoquerLesPartages: async () => ({ partagesRevoques: 2 }),
  })({ ...rattachements, maintenant })

describe('révoquer le partage des statistiques d’un compte', () => {
  it('révoque les partages de chacun des rôles du compte', async () => {
    expect(
      await revoquer({ mediateurId: MEDIATEUR, coordinateurId: COORDINATEUR }),
    ).toEqual({
      success: true,
      data: {
        proprietaires: [
          { _tag: 'Mediateur', mediateurId: MEDIATEUR },
          { _tag: 'Coordinateur', coordinateurId: COORDINATEUR },
        ],
        revoqueLe: maintenant,
        partagesRevoques: 2,
      },
    })
  })

  it('ne révoque rien pour un compte sans rôle', async () => {
    expect(await revoquer({ mediateurId: null, coordinateurId: null })).toEqual(
      {
        success: true,
        data: { proprietaires: [], revoqueLe: maintenant, partagesRevoques: 0 },
      },
    )
  })
})
