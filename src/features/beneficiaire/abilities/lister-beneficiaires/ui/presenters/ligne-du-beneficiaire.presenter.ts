import type { BeneficiaireListItem } from '@/features/beneficiaire/abilities/lister-beneficiaires/domain/liste-des-beneficiaires'
import { numberToString } from '@/libraries/nombre'

export type BeneficiaireRow = {
  readonly id: string
  readonly href: `/coop/mes-beneficiaires/${string}`
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
