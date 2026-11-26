import { describe, expect, it } from 'vitest'
import { CoordinateurId, MediateurId } from '../../../domain'
import { type CompteADetacher, compteADetacher } from './detachement'
import { detacherDesEquipes } from './detacher-des-equipes'

const mediateurId = MediateurId('550e8400-e29b-41d4-a716-446655440011')

const coordinateurId = CoordinateurId('550e8400-e29b-41d4-a716-446655440001')

const maintenant = new Date('2026-11-26T09:00:00Z')

const bilan = { invitationsSupprimees: 2, appartenancesRetirees: 1 }

const detacher = detacherDesEquipes({ retirerDesEquipes: async () => bilan })

describe('détacher un compte de ses équipes', () => {
  it('retire le médiateur et le coordinateur de leurs équipes à l’instant donné', async () => {
    const compte: CompteADetacher = {
      _tag: 'MediateurEtCoordinateur',
      mediateurId,
      coordinateurId,
    }

    expect(await detacher({ compte, maintenant })).toEqual({
      success: true,
      data: { detachement: { compte, retireesLe: maintenant }, bilan },
    })
  })

  it('ne détache rien d’un compte ni médiateur ni coordinateur', async () => {
    expect(
      await detacher({ compte: { _tag: 'SansEquipe' }, maintenant }),
    ).toEqual({
      success: true,
      data: {
        detachement: null,
        bilan: { invitationsSupprimees: 0, appartenancesRetirees: 0 },
      },
    })
  })
})

describe('compte à détacher', () => {
  it.each<{
    cas: string
    mediateurId: MediateurId | null
    coordinateurId: CoordinateurId | null
    compte: CompteADetacher
  }>([
    {
      cas: 'médiateur et coordinateur',
      mediateurId,
      coordinateurId,
      compte: { _tag: 'MediateurEtCoordinateur', mediateurId, coordinateurId },
    },
    {
      cas: 'médiateur seulement',
      mediateurId,
      coordinateurId: null,
      compte: { _tag: 'Mediateur', mediateurId },
    },
    {
      cas: 'coordinateur seulement',
      mediateurId: null,
      coordinateurId,
      compte: { _tag: 'Coordinateur', coordinateurId },
    },
    {
      cas: 'ni l’un ni l’autre',
      mediateurId: null,
      coordinateurId: null,
      compte: { _tag: 'SansEquipe' },
    },
  ])(
    'se lit d’un compte $cas',
    ({ mediateurId: mediateur, coordinateurId: coordinateur, compte }) => {
      expect(
        compteADetacher({
          mediateurId: mediateur,
          coordinateurId: coordinateur,
        }),
      ).toEqual(compte)
    },
  )
})
