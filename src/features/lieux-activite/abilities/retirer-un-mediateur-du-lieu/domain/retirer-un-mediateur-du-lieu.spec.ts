import { describe, expect, it } from 'vitest'
import type { Result } from '@/libraries/result'
import { LieuId } from '../../../domain/identifiants/lieu-id'
import { MediateurId } from '../../../domain/identifiants/mediateur-id'
import { RattachementId } from '../../../domain/identifiants/rattachement-id'
import { UtilisateurId } from '../../../domain/identifiants/utilisateur-id'
import type { EchecDeRetrait } from './errors'
import {
  type AuteurDuRetrait,
  type RattachementEnCours,
  retirerUnMediateurDuLieu,
} from './retirer-un-mediateur-du-lieu'

const marc = MediateurId('550e8400-e29b-41d4-a716-446655440021')
const alex = MediateurId('550e8400-e29b-41d4-a716-446655440022')
const lieuId = LieuId('550e8400-e29b-41d4-a716-446655440000')
const maintenant = new Date('2026-09-11T11:00:00Z')

const sansTitre: AuteurDuRetrait = {
  userId: UtilisateurId('550e8400-e29b-41d4-a716-446655440001'),
  mediateurId: null,
  estAdministrateur: false,
  coordonneLeMediateurRetire: false,
  nomAffiche: 'Camille Martin',
}

const rattachement: RattachementEnCours = {
  id: RattachementId('550e8400-e29b-41d4-a716-446655440031'),
  nomDuLieu: 'Médiathèque de Reims',
  emailDuMediateur: 'marc@example.fr',
  prenomDuMediateur: 'Marc',
}

const sansEffet = async () => undefined

describe('retirer un médiateur d’un lieu', () => {
  it.each<{
    cas: string
    auteur: AuteurDuRetrait
    attendu: Result<void, EchecDeRetrait>
  }>([
    {
      cas: 'le médiateur lui-même peut se retirer',
      auteur: { ...sansTitre, mediateurId: marc },
      attendu: { success: true, data: undefined },
    },
    {
      cas: 'le coordinateur de son équipe peut le retirer',
      auteur: { ...sansTitre, coordonneLeMediateurRetire: true },
      attendu: { success: true, data: undefined },
    },
    {
      cas: 'un administrateur peut le retirer',
      auteur: { ...sansTitre, estAdministrateur: true },
      attendu: { success: true, data: undefined },
    },
    {
      cas: 'un médiateur tiers ne peut pas le retirer',
      auteur: { ...sansTitre, mediateurId: alex },
      attendu: {
        success: false,
        error: { _tag: 'RetraitNonAutorise', mediateurId: marc },
      },
    },
    {
      cas: 'quelqu’un sans aucun de ces titres ne peut pas le retirer',
      auteur: sansTitre,
      attendu: {
        success: false,
        error: { _tag: 'RetraitNonAutorise', mediateurId: marc },
      },
    },
  ])('$cas', async ({ auteur, attendu }) => {
    expect(
      await retirerUnMediateurDuLieu({
        trouverLeRattachementEnCours: async () => rattachement,
        envoyerLeRetraitDuLieu: sansEffet,
        terminerLeRattachement: sansEffet,
      })({ mediateurId: marc, lieuId, auteur, maintenant }),
    ).toEqual(attendu)
  })

  it('refuse de retirer un médiateur qui n’est pas en activité sur le lieu', async () => {
    expect(
      await retirerUnMediateurDuLieu({
        trouverLeRattachementEnCours: async () => null,
        envoyerLeRetraitDuLieu: sansEffet,
        terminerLeRattachement: sansEffet,
      })({
        mediateurId: marc,
        lieuId,
        auteur: { ...sansTitre, mediateurId: marc },
        maintenant,
      }),
    ).toEqual({
      success: false,
      error: { _tag: 'PasEnActiviteSurCeLieu', mediateurId: marc, lieuId },
    })
  })
})
