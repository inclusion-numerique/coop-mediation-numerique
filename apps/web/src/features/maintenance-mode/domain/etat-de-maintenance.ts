import {
  MESSAGE_DE_MAINTENANCE_PAR_DEFAUT,
  type MessageDeMaintenance,
} from './message-de-maintenance'

export type EtatDeMaintenance =
  | { readonly _tag: 'Inactive' }
  | { readonly _tag: 'Active'; readonly message: MessageDeMaintenance | null }

export type RoleDuCompte = 'Admin' | 'Support' | 'User'

export const messageAffiche = (etat: EtatDeMaintenance): string =>
  etat._tag === 'Active'
    ? (etat.message ?? MESSAGE_DE_MAINTENANCE_PAR_DEFAUT)
    : MESSAGE_DE_MAINTENANCE_PAR_DEFAUT

export const peutModifierPendantLaMaintenance = ({
  role,
  etat,
}: {
  readonly role: RoleDuCompte
  readonly etat: EtatDeMaintenance
}): boolean => etat._tag === 'Inactive' || role !== 'User'
