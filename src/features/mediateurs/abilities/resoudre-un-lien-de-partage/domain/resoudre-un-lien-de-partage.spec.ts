import { describe, expect, it } from 'vitest'
import {
  CoordinateurId,
  MediateurId,
  UtilisateurId,
} from '@/features/mediateurs/domain'
import type { PartageLu } from './ports'
import { resoudreUnLienDePartage } from './resoudre-un-lien-de-partage'

const lien = 'a1b2c3d4-0000-4000-8000-000000000001'
const mediateurId = MediateurId('a1b2c3d4-0000-4000-8000-000000000002')
const coordinateurId = CoordinateurId('a1b2c3d4-0000-4000-8000-000000000003')
const utilisateurDuMediateur = UtilisateurId(
  'a1b2c3d4-0000-4000-8000-000000000004',
)
const utilisateurDuCoordinateur = UtilisateurId(
  'a1b2c3d4-0000-4000-8000-000000000005',
)

const resoudre = (partage: PartageLu | null, lienPartage: string) =>
  resoudreUnLienDePartage({ lirePartage: async () => partage })({
    lien: lienPartage,
  })

describe('résoudre un lien de partage', () => {
  it('résout le lien d’un médiateur, même aussi coordinateur, vers sa médiation', async () => {
    expect(
      await resoudre(
        {
          mediateur: { mediateurId, utilisateurId: utilisateurDuMediateur },
          coordinateur: {
            coordinateurId,
            utilisateurId: utilisateurDuCoordinateur,
          },
        },
        lien,
      ),
    ).toEqual({
      success: true,
      data: {
        proprietaire: { _tag: 'Mediateur', mediateurId },
        utilisateurId: utilisateurDuMediateur,
      },
    })
  })

  it('résout le lien d’un coordinateur', async () => {
    expect(
      await resoudre(
        {
          mediateur: null,
          coordinateur: {
            coordinateurId,
            utilisateurId: utilisateurDuCoordinateur,
          },
        },
        lien,
      ),
    ).toEqual({
      success: true,
      data: {
        proprietaire: { _tag: 'Coordinateur', coordinateurId },
        utilisateurId: utilisateurDuCoordinateur,
      },
    })
  })

  it.each<{ cas: string; partage: PartageLu | null; lienPartage: string }>([
    { cas: 'le lien est mal formé', partage: null, lienPartage: 'pas-un-lien' },
    {
      cas: 'aucun partage actif ne porte ce lien',
      partage: null,
      lienPartage: lien,
    },
    {
      cas: 'le partage n’a plus de propriétaire',
      partage: { mediateur: null, coordinateur: null },
      lienPartage: lien,
    },
  ])('ne trouve rien quand $cas', async ({ partage, lienPartage }) => {
    expect(await resoudre(partage, lienPartage)).toEqual({
      success: false,
      error: { _tag: 'LienIntrouvable' },
    })
  })
})
