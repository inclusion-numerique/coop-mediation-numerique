import { describe, expect, it } from 'vitest'
import { AnneeNaissance } from '@/features/beneficiaire/domain/annee-naissance'
import { BeneficiaireId } from '@/features/beneficiaire/domain/beneficiaire-id'
import { CommuneResidence } from '@/features/beneficiaire/domain/commune-residence'
import { Email } from '@/features/beneficiaire/domain/email'
import { Nom } from '@/features/beneficiaire/domain/nom'
import { Prenom } from '@/features/beneficiaire/domain/prenom'
import { Telephone } from '@/libraries/telephone'
import {
  doublonLu,
  valeurInvalideDuDoublonEnErreur,
} from './doublon-de-beneficiaire.transfer'

const maintenant = new Date('2026-06-15T12:00:00.000Z')

const creation = new Date('2025-01-05T08:00:00.000Z')

const ligne = {
  id: '5f0c7a52-1b9e-4c3a-9d2e-7a8b6c5d4e3f',
  nom: 'Martin',
  prenom: 'Léa',
  telephone: '+33102030405',
  email: 'lea@example.fr',
  creation,
  anneeNaissance: 1996,
  adresse: '12 rue de la Paix',
  commune: 'Évreux',
  communeCodePostal: '27000',
  communeCodeInsee: '27229',
}

describe('doublon lu en base', () => {
  it('décode chaque champ sans rien relever', () => {
    expect(doublonLu(ligne, maintenant)).toEqual({
      doublon: {
        id: BeneficiaireId('5f0c7a52-1b9e-4c3a-9d2e-7a8b6c5d4e3f'),
        nom: Nom('Martin'),
        prenom: Prenom('Léa'),
        telephone: Telephone('+33102030405'),
        email: Email('lea@example.fr'),
        creation,
        anneeNaissance: AnneeNaissance(maintenant)(1996),
        communeResidence: CommuneResidence({
          commune: 'Évreux',
          codePostal: '27000',
          codeInsee: '27229',
          adresse: '12 rue de la Paix',
        }),
      },
      invalides: [],
    })
  })

  it('tient pour absentes les valeurs anciennes devenues invalides et les relève', () => {
    expect(
      doublonLu(
        {
          ...ligne,
          telephone: 'NUMERO-LEGACY-INVALIDE',
          email: 'pas-un-courriel',
          anneeNaissance: 1850,
        },
        maintenant,
      ),
    ).toEqual({
      doublon: {
        id: BeneficiaireId('5f0c7a52-1b9e-4c3a-9d2e-7a8b6c5d4e3f'),
        nom: Nom('Martin'),
        prenom: Prenom('Léa'),
        telephone: null,
        email: null,
        creation,
        anneeNaissance: null,
        communeResidence: CommuneResidence({
          commune: 'Évreux',
          codePostal: '27000',
          codeInsee: '27229',
          adresse: '12 rue de la Paix',
        }),
      },
      invalides: ['telephone', 'email', 'anneeNaissance'],
    })
  })

  it('écarte un candidat à l’identifiant illisible et le relève', () => {
    expect(doublonLu({ ...ligne, id: 'invalide' }, maintenant)).toEqual({
      doublon: null,
      invalides: ['id'],
    })
  })

  it('nomme le champ invalide sans en donner la valeur', () => {
    expect(
      valeurInvalideDuDoublonEnErreur('5f0c7a52')('telephone').message,
    ).toBe(
      'Bénéficiaire 5f0c7a52 : telephone invalide en base, ignoré pour la détection des doublons',
    )
  })
})
