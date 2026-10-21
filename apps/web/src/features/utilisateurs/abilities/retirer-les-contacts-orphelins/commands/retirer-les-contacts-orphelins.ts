import {
  contactsAReconcilier,
  orphelinsParmi,
  type RetirerLesContactsOrphelinsPorts,
} from '../domain'
import { inscritsVivantsParmi } from '../implementation'

export type BilanDesContacts = {
  readonly contacts: number
  readonly anonymisesSupprimes: number
  readonly orphelinsRetires: number
  readonly echecs: readonly string[]
}

const appliquer = (
  courriels: readonly string[],
  action: (courriel: string) => Promise<void>,
): Promise<{ readonly faits: number; readonly echecs: readonly string[] }> =>
  courriels.reduce<
    Promise<{ readonly faits: number; readonly echecs: readonly string[] }>
  >(
    async (precedent, courriel) => {
      const bilan = await precedent
      return action(courriel).then(
        () => ({ ...bilan, faits: bilan.faits + 1 }),
        () => ({ ...bilan, echecs: [...bilan.echecs, courriel] }),
      )
    },
    Promise.resolve({ faits: 0, echecs: [] }),
  )

export const retirerLesContactsOrphelins = async (
  ports: RetirerLesContactsOrphelinsPorts,
): Promise<BilanDesContacts> => {
  const contacts = await ports.listerLesContacts()
  const { anonymises, rattaches } = contactsAReconcilier(contacts)
  const orphelins = orphelinsParmi(
    rattaches,
    await inscritsVivantsParmi(
      rattaches.map(({ utilisateurId }) => utilisateurId),
    ),
  )

  const suppressions = await appliquer(anonymises, ports.supprimerLeContact)
  const retraits = await appliquer(orphelins, ports.retirerLeContactDeLaListe)

  return {
    contacts: contacts.length,
    anonymisesSupprimes: suppressions.faits,
    orphelinsRetires: retraits.faits,
    echecs: [...suppressions.echecs, ...retraits.echecs],
  }
}
