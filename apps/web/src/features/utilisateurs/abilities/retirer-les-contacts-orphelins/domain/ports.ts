import type { AdresseCourriel } from '@app/web/features/utilisateurs/domain'
import type { ContactBrevo } from './contacts'

export type RetirerLesContactsOrphelinsPorts = {
  readonly listerLesContacts: () => Promise<readonly ContactBrevo[]>
  readonly supprimerLeContact: (courriel: AdresseCourriel) => Promise<void>
  readonly retirerLeContactDeLaListe: (
    courriel: AdresseCourriel,
  ) => Promise<void>
}
