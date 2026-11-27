import type { AdresseCourriel } from '@/features/utilisateurs/domain'
import { type EchecTechnique, type Result, success } from '@/libraries/result'
import {
  type ContactBrevo,
  comptesRattaches,
  contactsAReconcilier,
  orphelinsParmi,
  type PresenceDuContact,
} from './contacts'
import type { RetirerLesContactsOrphelinsPorts } from './ports'

export type BilanDesContacts = {
  readonly contacts: number
  readonly anonymisesSupprimes: readonly AdresseCourriel[]
  readonly orphelinsRetires: readonly AdresseCourriel[]
  readonly orphelinsSupprimes: readonly AdresseCourriel[]
  readonly echecs: readonly AdresseCourriel[]
}

type IssueDuContact = 'Inchange' | 'Supprime' | 'Retire' | 'RetireEtSupprime'

type Issues = {
  readonly parIssue: Readonly<
    Record<IssueDuContact, readonly AdresseCourriel[]>
  >
  readonly echecs: readonly AdresseCourriel[]
}

const AUCUNE_ISSUE: Issues = {
  parIssue: { Inchange: [], Supprime: [], Retire: [], RetireEtSupprime: [] },
  echecs: [],
}

const appliquer = (
  courriels: readonly AdresseCourriel[],
  action: (
    courriel: AdresseCourriel,
  ) => Promise<Result<IssueDuContact, EchecTechnique>>,
): Promise<Issues> =>
  courriels.reduce<Promise<Issues>>(async (precedentes, courriel) => {
    const issues = await precedentes
    const resultat = await action(courriel)
    if (!resultat.success)
      return { ...issues, echecs: [...issues.echecs, courriel] }
    return {
      ...issues,
      parIssue: {
        ...issues.parIssue,
        [resultat.data]: [...issues.parIssue[resultat.data], courriel],
      },
    }
  }, Promise.resolve(AUCUNE_ISSUE))

const estSansListe = (presence: PresenceDuContact): boolean =>
  presence._tag === 'Present' && presence.listes === 0

export const retirerLesContactsOrphelins =
  ({
    inscritsVivantsParmi,
    supprimerLeContact,
    retirerLeContactDeLaListe,
    lireLaPresenceDuContact,
  }: RetirerLesContactsOrphelinsPorts) =>
  async ({
    contacts,
  }: {
    readonly contacts: readonly ContactBrevo[]
  }): Promise<Result<BilanDesContacts, never>> => {
    const { anonymises, rattaches } = contactsAReconcilier(contacts)
    const orphelins = orphelinsParmi(
      rattaches,
      await inscritsVivantsParmi(comptesRattaches(rattaches)),
    )

    const supprimer = async (
      courriel: AdresseCourriel,
    ): Promise<Result<IssueDuContact, EchecTechnique>> => {
      const suppression = await supprimerLeContact(courriel)
      return suppression.success ? success('Supprime') : suppression
    }

    const retirer = async (
      courriel: AdresseCourriel,
    ): Promise<Result<IssueDuContact, EchecTechnique>> => {
      const retrait = await retirerLeContactDeLaListe(courriel)
      if (!retrait.success) return retrait
      if (retrait.data._tag === 'DejaAbsent') return success('Inchange')

      const presence = await lireLaPresenceDuContact(courriel)
      if (!presence.success) return presence
      if (!estSansListe(presence.data)) return success('Retire')

      const suppression = await supprimerLeContact(courriel)
      return suppression.success ? success('RetireEtSupprime') : suppression
    }

    const suppressions = await appliquer(anonymises, supprimer)
    const retraits = await appliquer(orphelins, retirer)

    return success({
      contacts: contacts.length,
      anonymisesSupprimes: suppressions.parIssue.Supprime,
      orphelinsRetires: orphelins.filter(
        (courriel) =>
          retraits.parIssue.Retire.includes(courriel) ||
          retraits.parIssue.RetireEtSupprime.includes(courriel),
      ),
      orphelinsSupprimes: retraits.parIssue.RetireEtSupprime,
      echecs: [...suppressions.echecs, ...retraits.echecs],
    })
  }
