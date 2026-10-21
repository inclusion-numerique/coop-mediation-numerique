import type { StatutCompte } from '../domain'

export type SeveriteDuStatut = 'new' | 'info' | 'success' | 'warning' | 'error'

const suffixe = (palier: number): string => (palier === 0 ? '' : ` J+${palier}`)

export const libelleDuStatut = (statut: StatutCompte): string => {
  if (statut._tag === 'Supprime') return 'Supprimé'
  if (statut._tag === 'Administrateur') return 'Admin'
  if (statut._tag === 'Support') return 'Support'
  if (statut._tag === 'InscriptionEnCours')
    return `Inscription en cours${suffixe(statut.palier)}`
  if (statut._tag === 'Nouveau') return `Nouveau${suffixe(statut.palier)}`
  if (statut._tag === 'Actif') return 'Actif'
  return `Inactif${suffixe(statut.palier)}`
}

const severiteDuPalier = (palier: number): SeveriteDuStatut | null => {
  if (palier >= 90) return 'error'
  if (palier >= 30) return 'warning'
  return null
}

const severiteParDefaut: Record<StatutCompte['_tag'], SeveriteDuStatut> = {
  Supprime: 'error',
  Administrateur: 'info',
  Support: 'info',
  InscriptionEnCours: 'new',
  Nouveau: 'info',
  Actif: 'success',
  Inactif: 'success',
}

export const severiteDuStatut = (statut: StatutCompte): SeveriteDuStatut =>
  ('palier' in statut ? severiteDuPalier(statut.palier) : null) ??
  severiteParDefaut[statut._tag]
