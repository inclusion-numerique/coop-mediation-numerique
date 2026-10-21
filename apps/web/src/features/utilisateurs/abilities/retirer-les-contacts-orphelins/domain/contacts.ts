import {
  type AdresseCourriel,
  estCourrielAnonymise,
  type UtilisateurId,
} from '@app/web/features/utilisateurs/domain'

export type CompteDuContact =
  | { readonly _tag: 'Aucun' }
  | { readonly _tag: 'Inconnu' }
  | { readonly _tag: 'Compte'; readonly utilisateurId: UtilisateurId }

export type ContactBrevo = {
  readonly courriel: AdresseCourriel
  readonly compte: CompteDuContact
}

export type ContactRattache = {
  readonly courriel: AdresseCourriel
  readonly compte: Exclude<CompteDuContact, { readonly _tag: 'Aucun' }>
}

export type ContactsAReconcilier = {
  readonly anonymises: readonly AdresseCourriel[]
  readonly rattaches: readonly ContactRattache[]
}

const estRattache = (contact: ContactBrevo): contact is ContactRattache =>
  contact.compte._tag !== 'Aucun'

export const contactsAReconcilier = (
  contacts: readonly ContactBrevo[],
): ContactsAReconcilier => ({
  anonymises: contacts
    .filter(({ courriel }) => estCourrielAnonymise(courriel))
    .map(({ courriel }) => courriel),
  rattaches: contacts
    .filter(({ courriel }) => !estCourrielAnonymise(courriel))
    .filter(estRattache),
})

export const comptesRattaches = (
  rattaches: ContactsAReconcilier['rattaches'],
): readonly UtilisateurId[] =>
  rattaches.flatMap(({ compte }) =>
    compte._tag === 'Compte' ? [compte.utilisateurId] : [],
  )

export const orphelinsParmi = (
  rattaches: ContactsAReconcilier['rattaches'],
  inscritsVivants: ReadonlySet<UtilisateurId>,
): readonly AdresseCourriel[] =>
  rattaches
    .filter(
      ({ compte }) =>
        compte._tag === 'Inconnu' || !inscritsVivants.has(compte.utilisateurId),
    )
    .map(({ courriel }) => courriel)
