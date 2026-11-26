import { describe, expect, it } from 'vitest'
import { CoordinateurId, MediateurId } from '../../../domain'
import { detacherDesEquipes } from './detacher-des-equipes'

const mediateurId = MediateurId('550e8400-e29b-41d4-a716-446655440011')

const coordinateurId = CoordinateurId('550e8400-e29b-41d4-a716-446655440001')

const maintenant = new Date('2026-11-26T09:00:00Z')

const bilan = { invitationsSupprimees: 2, appartenancesRetirees: 1 }

const detacher = detacherDesEquipes({ retirerDesEquipes: async () => bilan })

describe('détacher un compte de ses équipes', () => {
  it('retire le médiateur et le coordinateur de leurs équipes à l’instant donné', async () => {
    expect(await detacher({ mediateurId, coordinateurId, maintenant })).toEqual(
      {
        success: true,
        data: {
          detachement: { mediateurId, coordinateurId, retireesLe: maintenant },
          bilan,
        },
      },
    )
  })

  it('ne détache rien d’un compte ni médiateur ni coordinateur', async () => {
    expect(
      await detacher({ mediateurId: null, coordinateurId: null, maintenant }),
    ).toEqual({
      success: true,
      data: {
        detachement: null,
        bilan: { invitationsSupprimees: 0, appartenancesRetirees: 0 },
      },
    })
  })
})
