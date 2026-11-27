import { describe, expect, it } from 'vitest'
import { AnneeNaissance } from '@/features/beneficiaire/domain/annee-naissance'
import { Email } from '@/features/beneficiaire/domain/email'
import { MediateurId } from '@/features/beneficiaire/domain/mediateur-id'
import { NOM_MAX_LENGTH, Nom } from '@/features/beneficiaire/domain/nom'
import { Prenom } from '@/features/beneficiaire/domain/prenom'
import { Telephone } from '@/libraries/telephone'
import type { UsagerNormalise } from '../../domain/usager-externe'
import {
  type DemandeDUsagersExternes,
  demandeNormalisee,
  type UsagerExterneAFusionner,
} from './usager-externe.transfer'

const maintenant = new Date('2026-06-15T12:00:00.000Z')

const mediateurId = MediateurId('8a1b2c3d-4e5f-4a6b-8c7d-9e0f1a2b3c4d')

const usagerSansDonnees: UsagerExterneAFusionner = {
  rdvUserId: 42,
  nom: null,
  prenom: null,
  telephone: null,
  email: null,
  adresse: null,
  birthDate: null,
}

const normaliseSansDonnees: UsagerNormalise = {
  rdvUserId: 42,
  nom: null,
  prenom: null,
  telephone: null,
  email: null,
  adresse: null,
  anneeNaissance: null,
}

const demande = (usager: UsagerExterneAFusionner): DemandeDUsagersExternes => ({
  usagers: [usager],
  mediateurId,
  maintenant,
})

describe('demande de fusion reçue de RDV Service Public', () => {
  it.each<{
    cas: string
    usager: UsagerExterneAFusionner
    attendu: UsagerNormalise
  }>([
    {
      cas: 'décode l’identité, le contact et l’année de naissance',
      usager: {
        rdvUserId: 42,
        nom: '  Martin ',
        prenom: 'Léa',
        telephone: '0102030405',
        email: ' Lea@Example.fr ',
        adresse: '12 rue de la Paix, 27000 Évreux',
        birthDate: new Date('1996-03-01T12:00:00.000Z'),
      },
      attendu: {
        rdvUserId: 42,
        nom: Nom('Martin'),
        prenom: Prenom('Léa'),
        telephone: Telephone('0102030405'),
        email: Email('lea@example.fr'),
        adresse: '12 rue de la Paix, 27000 Évreux',
        anneeNaissance: AnneeNaissance(maintenant)(1996),
      },
    },
    {
      cas: 'laisse vides les champs absents',
      usager: usagerSansDonnees,
      attendu: normaliseSansDonnees,
    },
    {
      cas: 'tronque un nom et un prénom trop longs',
      usager: {
        ...usagerSansDonnees,
        nom: 'N'.repeat(NOM_MAX_LENGTH + 5),
        prenom: 'P'.repeat(NOM_MAX_LENGTH + 5),
      },
      attendu: {
        ...normaliseSansDonnees,
        nom: Nom('N'.repeat(NOM_MAX_LENGTH)),
        prenom: Prenom('P'.repeat(NOM_MAX_LENGTH)),
      },
    },
    {
      cas: 'ignore un nom et un prénom faits d’espaces',
      usager: { ...usagerSansDonnees, nom: '   ', prenom: '   ' },
      attendu: normaliseSansDonnees,
    },
    {
      cas: 'ignore un courriel et un téléphone invalides',
      usager: {
        ...usagerSansDonnees,
        email: 'pas-un-courriel',
        telephone: 'pas-un-numero',
      },
      attendu: normaliseSansDonnees,
    },
    {
      cas: 'ignore le 1er janvier 1900, date que RDV Service Public donne à défaut',
      usager: {
        ...usagerSansDonnees,
        birthDate: new Date('1900-01-01T12:00:00.000Z'),
      },
      attendu: normaliseSansDonnees,
    },
    {
      cas: 'ignore une naissance dans le futur',
      usager: {
        ...usagerSansDonnees,
        birthDate: new Date('2999-05-04T12:00:00.000Z'),
      },
      attendu: normaliseSansDonnees,
    },
  ])('$cas', ({ usager, attendu }) => {
    expect(demandeNormalisee(demande(usager))).toEqual({
      usagers: [attendu],
      mediateurId,
      maintenant,
    })
  })
})
