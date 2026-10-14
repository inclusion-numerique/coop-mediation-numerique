import { dateAsDay } from '@app/web/utils/dateAsDay'

export const SEUIL_INACTIVITE_EN_JOURS = 30

export type DerniereActivite =
  | { readonly type: 'Aucune' }
  | { readonly type: 'Le'; readonly date: Date }

export type StatutMembre =
  | { readonly type: 'Invitation'; readonly envoyeeLe: Date }
  | { readonly type: 'Actif'; readonly derniereActivite: Date }
  | { readonly type: 'Inactif'; readonly derniereActivite: DerniereActivite }
  | {
      readonly type: 'AncienMembre'
      readonly depuis: Date
      readonly jusquA: Date
    }
  | { readonly type: 'ProfilSupprime'; readonly le: Date }

export type TypeDeStatut = StatutMembre['type']

export const libelleStatutMembre = (statut: StatutMembre): string => {
  switch (statut.type) {
    case 'Invitation':
      return `Invitation envoyée le ${dateAsDay(statut.envoyeeLe)}`
    case 'Inactif':
      return statut.derniereActivite.type === 'Aucune'
        ? 'Inactif'
        : `Inactif depuis le ${dateAsDay(statut.derniereActivite.date)}`
    case 'AncienMembre':
      return `Ancien membre depuis le ${dateAsDay(statut.jusquA)}`
    case 'ProfilSupprime':
      return `Profil supprimé le ${dateAsDay(statut.le)}`
    default:
      return 'Actif'
  }
}
