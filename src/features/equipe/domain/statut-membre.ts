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
