import { describe, expect, it } from 'vitest'
import { AnneeNaissance } from '@/features/beneficiaire/domain/annee-naissance'
import type { BeneficiaireIdentifie } from '@/features/beneficiaire/domain/beneficiaire'
import { BeneficiaireId } from '@/features/beneficiaire/domain/beneficiaire-id'
import { Genre } from '@/features/beneficiaire/domain/genre'
import { MediateurId } from '@/features/beneficiaire/domain/mediateur-id'
import { Nom } from '@/features/beneficiaire/domain/nom'
import { Prenom } from '@/features/beneficiaire/domain/prenom'
import { StatutSocial } from '@/features/beneficiaire/domain/statut-social'
import { TrancheAge } from '@/features/beneficiaire/domain/tranche-age'
import type { BeneficiaireACreer } from './beneficiaire-a-creer'
import { creerBeneficiaire } from './creer-beneficiaire'

const beneficiaireId = BeneficiaireId('5f0c7a52-1b9e-4c3a-9d2e-7a8b6c5d4e3f')

const mediateurId = MediateurId('8a1b2c3d-4e5f-4a6b-8c7d-9e0f1a2b3c4d')

const maintenant = new Date('2026-11-26T10:00:00.000Z')

const beneficiaire: BeneficiaireACreer = {
  prenom: Prenom('Léa'),
  nom: Nom('Martin'),
  contactTelephone: { _tag: 'nonRenseigne' },
  email: null,
  anneeNaissance: AnneeNaissance(maintenant)(1996),
  communeResidence: null,
  genre: Genre('Feminin'),
  trancheAge: TrancheAge('NonCommunique'),
  statutSocial: StatutSocial('NonCommunique'),
  notes: null,
}

describe('créer un bénéficiaire', () => {
  it('enregistre un bénéficiaire identifié créé maintenant, dont la tranche d’âge suit l’année de naissance', async () => {
    expect(
      await creerBeneficiaire({
        enregistrerLeBeneficiaire: async () => undefined,
      })({ beneficiaire, beneficiaireId, mediateurId, maintenant }),
    ).toEqual({
      success: true,
      data: {
        ...beneficiaire,
        id: beneficiaireId,
        mediateurId,
        anonyme: false,
        trancheAge: TrancheAge('VingtCinqTrenteNeuf'),
        creation: maintenant,
        modification: maintenant,
        suppression: null,
      } satisfies BeneficiaireIdentifie,
    })
  })
})
