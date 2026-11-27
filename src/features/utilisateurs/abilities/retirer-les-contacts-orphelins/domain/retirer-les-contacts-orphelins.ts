import {
  type AdresseCourriel,
  type RetraitDuContact,
  retirerLeContactDesListes,
} from '@/features/utilisateurs/domain'
import { type EchecTechnique, type Result, success } from '@/libraries/result'
import {
  type ContactBrevo,
  comptesRattaches,
  contactsAReconcilier,
  orphelinsParmi,
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

const ISSUE_DU_RETRAIT: Readonly<
  Record<
    RetraitDuContact['listeDesUtilisateurs']['_tag'],
    Readonly<Record<RetraitDuContact['contact']['_tag'], IssueDuContact>>
  >
> = {
  Retire: { Conserve: 'Retire', Supprime: 'RetireEtSupprime' },
  DejaAbsent: { Conserve: 'Inchange', Supprime: 'Supprime' },
}

const issueDuRetrait = ({
  listeDesUtilisateurs,
  contact,
}: RetraitDuContact): IssueDuContact =>
  ISSUE_DU_RETRAIT[listeDesUtilisateurs._tag][contact._tag]

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

    const retirerDesListes = retirerLeContactDesListes({
      retirerLeContactDeLaListe,
      lireLaPresenceDuContact,
      supprimerLeContact,
    })

    const retirer = async (
      courriel: AdresseCourriel,
    ): Promise<Result<IssueDuContact, EchecTechnique>> => {
      const retrait = await retirerDesListes({ courriel })
      return retrait.success ? success(issueDuRetrait(retrait.data)) : retrait
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
      orphelinsSupprimes: orphelins.filter(
        (courriel) =>
          retraits.parIssue.RetireEtSupprime.includes(courriel) ||
          retraits.parIssue.Supprime.includes(courriel),
      ),
      echecs: [...suppressions.echecs, ...retraits.echecs],
    })
  }
