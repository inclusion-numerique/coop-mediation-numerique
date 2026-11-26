import { describe, expect, it } from 'vitest'
import { EchecTechnique } from '@/libraries/result'
import type { UsagerEcarte } from '../../domain/fusion-des-usagers'
import { usagerEcarteEnErreur } from './usagers-ecartes.adapter'

describe('usager écarté de la fusion', () => {
  it.each<{ cas: string; ecarte: UsagerEcarte; message: string }>([
    {
      cas: 'une panne technique en donne la cause',
      ecarte: { rdvUserId: 42, reason: EchecTechnique('base indisponible') },
      message:
        'Usager RDV 42 écarté de la fusion des bénéficiaires : EchecTechnique (base indisponible)',
    },
    {
      cas: 'une identité incomplète en donne le motif',
      ecarte: {
        rdvUserId: 43,
        reason: { _tag: 'IdentiteIncomplete', rdvUserId: 43 },
      },
      message:
        'Usager RDV 43 écarté de la fusion des bénéficiaires : IdentiteIncomplete',
    },
  ])('$cas', ({ ecarte, message }) => {
    expect(usagerEcarteEnErreur(ecarte).message).toBe(message)
  })
})
