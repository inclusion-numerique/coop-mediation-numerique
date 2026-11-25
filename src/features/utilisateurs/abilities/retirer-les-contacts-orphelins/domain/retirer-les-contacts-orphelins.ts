import type {
  AdresseCourriel,
  UtilisateurId,
} from '@/features/utilisateurs/domain'
import {
  comptesRattaches,
  contactsAReconcilier,
  orphelinsParmi,
  type RetirerLesContactsOrphelinsPorts,
} from './index'

export type BilanDesContacts = {
  readonly contacts: number
  readonly anonymisesSupprimes: number
  readonly orphelinsRetires: number
  readonly echecs: readonly AdresseCourriel[]
}

const appliquer = (
  courriels: readonly AdresseCourriel[],
  action: (courriel: AdresseCourriel) => Promise<boolean>,
): Promise<{
  readonly faits: number
  readonly echecs: readonly AdresseCourriel[]
}> =>
  courriels.reduce<
    Promise<{
      readonly faits: number
      readonly echecs: readonly AdresseCourriel[]
    }>
  >(
    async (precedent, courriel) => {
      const bilan = await precedent
      return action(courriel).then(
        (fait) => (fait ? { ...bilan, faits: bilan.faits + 1 } : bilan),
        () => ({ ...bilan, echecs: [...bilan.echecs, courriel] }),
      )
    },
    Promise.resolve({ faits: 0, echecs: [] }),
  )

export type RetirerLesContactsOrphelinsDependances =
  RetirerLesContactsOrphelinsPorts & {
    readonly inscritsVivantsParmi: (
      identifiants: readonly UtilisateurId[],
    ) => Promise<ReadonlySet<UtilisateurId>>
  }

export const retirerLesContactsOrphelins =
  (ports: RetirerLesContactsOrphelinsDependances) =>
  async (): Promise<BilanDesContacts> => {
    const contacts = await ports.listerLesContacts()
    const { anonymises, rattaches } = contactsAReconcilier(contacts)
    const orphelins = orphelinsParmi(
      rattaches,
      await ports.inscritsVivantsParmi(comptesRattaches(rattaches)),
    )

    const suppressions = await appliquer(anonymises, async (courriel) => {
      await ports.supprimerLeContact(courriel)
      return true
    })
    const retraits = await appliquer(
      orphelins,
      async (courriel) =>
        (await ports.retirerLeContactDeLaListe(courriel))._tag === 'Retire',
    )

    return {
      contacts: contacts.length,
      anonymisesSupprimes: suppressions.faits,
      orphelinsRetires: retraits.faits,
      echecs: [...suppressions.echecs, ...retraits.echecs],
    }
  }
