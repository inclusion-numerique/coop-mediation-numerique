import type { BeneficiaireListItem } from '@app/web/features/beneficiaire/abilities/lister-beneficiaires/domain/lister-beneficiaires'
import { AnneeNaissance } from '@app/web/features/beneficiaire/domain/annee-naissance'
import { BeneficiaireId } from '@app/web/features/beneficiaire/domain/beneficiaire-id'
import { Genre } from '@app/web/features/beneficiaire/domain/genre'
import { MediateurId } from '@app/web/features/beneficiaire/domain/mediateur-id'
import { Nom } from '@app/web/features/beneficiaire/domain/nom'
import { Prenom } from '@app/web/features/beneficiaire/domain/prenom'
import { StatutSocial } from '@app/web/features/beneficiaire/domain/statut-social'
import { TrancheAge } from '@app/web/features/beneficiaire/domain/tranche-age'

const baseId = '00000000-0000-0000-0000-0000000000'

/**
 * Construit un `BeneficiaireListItem` minimal et valide via les smart
 * constructors, pour les tests de la couche UI (presenter / row VM).
 */
export const aBeneficiaireListItem = (
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
