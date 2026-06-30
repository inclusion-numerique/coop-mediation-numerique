import type { BeneficiaireListItem } from '@app/web/features/beneficiaire/abilities/lister-beneficiaires/domain/lister-beneficiaires'
import { numberToString } from '@app/web/utils/formatNumber'

/**
 * Ligne d'affichage de la table : projection plate (chaînes prêtes à rendre)
 * d'un `BeneficiaireListItem`. La table ne manipule que ce VM, jamais le domaine.
 */
export type BeneficiaireRow = {
  readonly id: string
  readonly href: string
  readonly label: string
  readonly nom: string
  readonly prenom: string
  readonly anneeNaissance: string
  readonly accompagnementsCount: string
}

export const toBeneficiaireRow = (
  item: BeneficiaireListItem,
): BeneficiaireRow => ({
  id: item.id,
  href: `/coop/mes-beneficiaires/${item.id}`,
  label: `${item.prenom} ${item.nom}`,
  nom: item.nom,
  prenom: item.prenom,
  anneeNaissance: item.anneeNaissance ? item.anneeNaissance.toString() : '-',
  accompagnementsCount: numberToString(item.accompagnementsCount),
})
