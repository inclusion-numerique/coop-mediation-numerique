import type { ContactBrevo } from './contacts'

export type RetirerLesContactsOrphelinsPorts = {
  readonly listerLesContacts: () => Promise<readonly ContactBrevo[]>
  readonly supprimerLeContact: (courriel: string) => Promise<void>
  readonly retirerLeContactDeLaListe: (courriel: string) => Promise<void>
}
