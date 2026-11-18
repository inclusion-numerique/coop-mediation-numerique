import type { BeneficiaireListItem } from '@/features/beneficiaire/abilities/lister-beneficiaires/domain/lister-beneficiaires'
import { AnneeNaissance } from '@/features/beneficiaire/domain/annee-naissance'
import { BeneficiaireId } from '@/features/beneficiaire/domain/beneficiaire-id'
import { Genre } from '@/features/beneficiaire/domain/genre'
import { MediateurId } from '@/features/beneficiaire/domain/mediateur-id'
import { Nom } from '@/features/beneficiaire/domain/nom'
import { Prenom } from '@/features/beneficiaire/domain/prenom'
import { StatutSocial } from '@/features/beneficiaire/domain/statut-social'
import { TrancheAge } from '@/features/beneficiaire/domain/tranche-age'

const baseId = '00000000-0000-0000-0000-0000000000'

/**
 * Construit un `BeneficiaireListItem` minimal et valide via les smart
 * constructors, pour les tests de la couche UI (presenter / row VM).
 */
export const beneficiaireListItem = (
  overrides: Partial<{
    index: number
    prenom: string
    nom: string
    anneeNaissance: number | null
    accompagnementsCount: number
  }> = {},
): BeneficiaireListItem => {
  const index = overrides.index ?? 1
  return {
    id: BeneficiaireId(`${baseId}${index.toString().padStart(2, '0')}`),
    mediateurId: MediateurId('00000000-0000-0000-0000-0000000000aa'),
    prenom: Prenom(overrides.prenom ?? 'Jean'),
    nom: Nom(overrides.nom ?? 'Dupont'),
    telephone: null,
    email: null,
    anneeNaissance:
      overrides.anneeNaissance === null
        ? null
        : AnneeNaissance(overrides.anneeNaissance ?? 1990),
    trancheAge: TrancheAge(null),
    genre: Genre(null),
    statutSocial: StatutSocial(null),
    communeResidence: null,
    creation: new Date('2024-01-01T00:00:00.000Z'),
    accompagnementsCount: overrides.accompagnementsCount ?? 0,
    notes: null,
  }
}
