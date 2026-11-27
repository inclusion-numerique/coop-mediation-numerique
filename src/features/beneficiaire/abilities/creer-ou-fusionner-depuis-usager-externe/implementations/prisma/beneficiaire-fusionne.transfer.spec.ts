import { describe, expect, it } from 'vitest'
import { AnneeNaissance } from '@/features/beneficiaire/domain/annee-naissance'
import { BeneficiaireId } from '@/features/beneficiaire/domain/beneficiaire-id'
import { Email } from '@/features/beneficiaire/domain/email'
import { MediateurId } from '@/features/beneficiaire/domain/mediateur-id'
import { Nom } from '@/features/beneficiaire/domain/nom'
import { Prenom } from '@/features/beneficiaire/domain/prenom'
import { Telephone } from '@/libraries/telephone'
import type { MergedBeneficiaire } from '../../domain/usager-externe'
import { versBeneficiaireFusionne } from './beneficiaire-fusionne.transfer'

const maintenant = new Date('2026-06-15T12:00:00.000Z')

const ligne = {
  id: '5f0c7a52-1b9e-4c3a-9d2e-7a8b6c5d4e3f',
  prenom: 'Léa',
  nom: 'Martin',
  email: 'lea@example.fr',
  telephone: '+33102030405',
  mediateurId: '8a1b2c3d-4e5f-4a6b-8c7d-9e0f1a2b3c4d',
  adresse: '12 rue de la Paix, 27000 Évreux',
  anneeNaissance: 1996,
  commune: 'Évreux',
}

const fusionne: MergedBeneficiaire = {
  id: BeneficiaireId('5f0c7a52-1b9e-4c3a-9d2e-7a8b6c5d4e3f'),
  prenom: Prenom('Léa'),
  nom: Nom('Martin'),
  email: Email('lea@example.fr'),
  telephone: Telephone('+33102030405'),
  mediateurId: MediateurId('8a1b2c3d-4e5f-4a6b-8c7d-9e0f1a2b3c4d'),
  adresse: '12 rue de la Paix, 27000 Évreux',
  anneeNaissance: AnneeNaissance(maintenant)(1996),
  commune: 'Évreux',
}

const vide: MergedBeneficiaire = {
  ...fusionne,
  prenom: null,
  nom: null,
  email: null,
  telephone: null,
  adresse: null,
  anneeNaissance: null,
  commune: null,
}

describe('bénéficiaire fusionné lu en base', () => {
  it('décode chaque champ en value object', () => {
    expect(versBeneficiaireFusionne(ligne, maintenant)).toEqual(fusionne)
  })

  it('laisse vides les champs absents', () => {
    expect(
      versBeneficiaireFusionne(
        {
          ...ligne,
          prenom: null,
          nom: null,
          email: null,
          telephone: null,
          adresse: null,
          anneeNaissance: null,
          commune: null,
        },
        maintenant,
      ),
    ).toEqual(vide)
  })

  it('tient pour absentes les valeurs anciennes devenues invalides', () => {
    expect(
      versBeneficiaireFusionne(
        {
          ...ligne,
          prenom: ' ',
          nom: ' ',
          email: 'pas-un-courriel',
          telephone: 'NUMERO-LEGACY-INVALIDE',
          adresse: null,
          anneeNaissance: 1850,
          commune: null,
        },
        maintenant,
      ),
    ).toEqual(vide)
  })

  it('refuse un identifiant de bénéficiaire invalide', () => {
    expect(() =>
      versBeneficiaireFusionne({ ...ligne, id: 'invalide' }, maintenant),
    ).toThrow()
  })
})
