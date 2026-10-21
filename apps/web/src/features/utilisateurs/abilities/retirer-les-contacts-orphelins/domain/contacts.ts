import {
  AdresseCourriel,
  estCourrielAnonymise,
} from '@app/web/features/utilisateurs/domain'

export type ContactBrevo = {
  readonly courriel: string | null
  readonly identifiantExterne: string | null
}

export type ContactsAReconcilier = {
  readonly anonymises: readonly string[]
  readonly rattaches: readonly {
    readonly utilisateurId: string
    readonly courriel: string
  }[]
}

const estAnonymise = (courriel: string | null): boolean => {
  const adresse = courriel === null ? null : AdresseCourriel.safe(courriel)
  return adresse !== null && estCourrielAnonymise(adresse)
}

export const contactsAReconcilier = (
  contacts: readonly ContactBrevo[],
): ContactsAReconcilier => ({
  anonymises: contacts.flatMap(({ courriel }) =>
    courriel !== null && estAnonymise(courriel) ? [courriel] : [],
  ),
  rattaches: contacts.flatMap(({ courriel, identifiantExterne }) =>
    courriel !== null && identifiantExterne !== null && !estAnonymise(courriel)
      ? [{ utilisateurId: identifiantExterne, courriel }]
      : [],
  ),
})

export const orphelinsParmi = (
  rattaches: ContactsAReconcilier['rattaches'],
  inscritsVivants: ReadonlySet<string>,
): readonly string[] =>
  rattaches
    .filter(({ utilisateurId }) => !inscritsVivants.has(utilisateurId))
    .map(({ courriel }) => courriel)
