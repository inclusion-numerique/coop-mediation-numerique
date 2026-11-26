import type { ColonneTriableDesBeneficiaires } from '@/features/beneficiaire/abilities/lister-beneficiaires/domain/liste-des-beneficiaires'
import type { BeneficiaireRow } from '../presenters/ligne-du-beneficiaire.presenter'

/**
 * Description déclarative des colonnes triables. `tri` est aligné sur le champ
 * de tri du domaine et sur la clé d'affichage du `BeneficiaireRow`.
 */
export type BeneficiaireColumn = {
  readonly tri: ColonneTriableDesBeneficiaires
  readonly field: keyof Pick<
    BeneficiaireRow,
    'nom' | 'prenom' | 'anneeNaissance' | 'accompagnementsCount'
  >
  readonly label: string
  readonly alignRight?: boolean
}

export const beneficiairesColumns: readonly BeneficiaireColumn[] = [
  { tri: 'nom', field: 'nom', label: 'Nom' },
  { tri: 'prenom', field: 'prenom', label: 'Prénom' },
  {
    tri: 'anneeNaissance',
    field: 'anneeNaissance',
    label: 'Année de naissance',
    alignRight: true,
  },
  {
    tri: 'accompagnementsCount',
    field: 'accompagnementsCount',
    label: 'Accompagnements',
    alignRight: true,
  },
]
