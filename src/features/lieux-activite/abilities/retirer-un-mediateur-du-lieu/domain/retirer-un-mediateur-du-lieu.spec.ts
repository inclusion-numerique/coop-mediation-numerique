import { describe, expect, it } from 'vitest'
import { LieuId } from '../../../domain/identifiants/lieu-id'
import { MediateurId } from '../../../domain/identifiants/mediateur-id'
import { RattachementId } from '../../../domain/identifiants/rattachement-id'
import { UtilisateurId } from '../../../domain/identifiants/utilisateur-id'
import { retirerUnMediateurDuLieu } from './retirer-un-mediateur-du-lieu'
import type {
  AuteurDuRetrait,
  AvisDeRetrait,
  RattachementEnCours,
} from './retrait-du-lieu'

const marc = MediateurId('550e8400-e29b-41d4-a716-446655440021')
const alex = MediateurId('550e8400-e29b-41d4-a716-446655440022')
const lieuId = LieuId('550e8400-e29b-41d4-a716-446655440000')
const maintenant = new Date('2026-09-11T11:00:00Z')
const auteurId = UtilisateurId('550e8400-e29b-41d4-a716-446655440001')

const sansTitre: AuteurDuRetrait = {
  userId: auteurId,
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

const avis: AvisDeRetrait = {
  mediateurEmail: 'marc@example.fr',
  mediateurFirstname: 'Marc',
  structureNom: 'Médiathèque de Reims',
  removedByName: 'Camille Martin',
}

const sansEffet = async () => undefined

const retirer = ({
  auteur,
  rattachementLu,
}: {
  readonly auteur: AuteurDuRetrait
  readonly rattachementLu: RattachementEnCours | null
}) =>
  retirerUnMediateurDuLieu({
    trouverLeRattachementEnCours: async () => rattachementLu,
    envoyerLeRetraitDuLieu: sansEffet,
    terminerLeRattachement: sansEffet,
  })({ mediateurId: marc, lieuId, auteur, maintenant })

describe('retirer un médiateur d’un lieu', () => {
  it.each<{
    cas: string
    auteur: AuteurDuRetrait
    avis: AvisDeRetrait | null
  }>([
    {
      cas: 'le médiateur lui-même se retire, sans en être prévenu',
      auteur: { ...sansTitre, mediateurId: marc },
      avis: null,
    },
    {
      cas: 'le coordinateur de son équipe le retire et le prévient',
      auteur: { ...sansTitre, coordonneLeMediateurRetire: true },
      avis,
    },
    {
      cas: 'un administrateur le retire et le prévient',
      auteur: { ...sansTitre, estAdministrateur: true },
      avis,
    },
  ])('$cas', async ({ auteur, avis }) => {
    expect(await retirer({ auteur, rattachementLu: rattachement })).toEqual({
      success: true,
      data: {
        fin: { id: rattachement.id, par: auteurId, maintenant },
        avis,
      },
    })
  })

  it.each<{ cas: string; auteur: AuteurDuRetrait }>([
    {
      cas: 'un médiateur tiers',
      auteur: { ...sansTitre, mediateurId: alex },
    },
    { cas: 'quelqu’un sans aucun titre', auteur: sansTitre },
  ])('refuse le retrait par $cas', async ({ auteur }) => {
    expect(await retirer({ auteur, rattachementLu: rattachement })).toEqual({
      success: false,
      error: { _tag: 'RetraitNonAutorise', mediateurId: marc },
    })
  })

  it('refuse de retirer un médiateur qui n’est pas en activité sur le lieu', async () => {
    expect(
      await retirer({
        auteur: { ...sansTitre, mediateurId: marc },
        rattachementLu: null,
      }),
    ).toEqual({
      success: false,
      error: { _tag: 'PasEnActiviteSurCeLieu', mediateurId: marc, lieuId },
    })
  })
})
