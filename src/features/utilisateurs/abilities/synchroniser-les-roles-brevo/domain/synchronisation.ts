import type {
  AdresseCourriel,
  ContactAImporter,
  InscritDeLaListe,
  UtilisateurId,
} from '@app/web/features/utilisateurs/domain'
import { contactASynchroniser } from '@app/web/features/utilisateurs/domain'
import type { IdentifiantDImport } from './identifiant-d-import'

export type LectureDesInscrits = {
  readonly inscrits: readonly InscritDeLaListe[]
  readonly illisibles: readonly UtilisateurId[]
}

export type ContactsASynchroniser = {
  readonly aImporter: readonly ContactAImporter[]
  readonly aRetirer: readonly AdresseCourriel[]
}

export const contactsASynchroniser = (
  inscrits: readonly InscritDeLaListe[],
): ContactsASynchroniser =>
  inscrits.map(contactASynchroniser).reduce<ContactsASynchroniser>(
    (partition, contact) =>
      contact._tag === 'AImporter'
        ? {
            ...partition,
            aImporter: [...partition.aImporter, contact.contact],
          }
        : {
            ...partition,
            aRetirer: [...partition.aRetirer, contact.courriel],
          },
    { aImporter: [], aRetirer: [] },
  )

export type EchecDeLot =
  | {
      readonly _tag: 'ImportEchoue'
      readonly courriels: readonly AdresseCourriel[]
    }
  | {
      readonly _tag: 'RetraitEchoue'
      readonly courriels: readonly AdresseCourriel[]
    }

export type BilanDeSynchronisation = {
  readonly inscrits: number
  readonly importes: number
  readonly retires: number
  readonly illisibles: readonly UtilisateurId[]
  readonly imports: readonly IdentifiantDImport[]
  readonly echecs: readonly EchecDeLot[]
}
