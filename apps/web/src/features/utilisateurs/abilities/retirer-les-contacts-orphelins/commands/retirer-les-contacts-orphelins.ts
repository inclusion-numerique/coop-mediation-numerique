import type { AdresseCourriel } from '@app/web/features/utilisateurs/domain'
import {
  comptesRattaches,
  contactsAReconcilier,
  orphelinsParmi,
  type RetirerLesContactsOrphelinsPorts,
} from '../domain'
import { inscritsVivantsParmi } from '../implementation'

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

export const retirerLesContactsOrphelins = async (
  ports: RetirerLesContactsOrphelinsPorts,
): Promise<BilanDesContacts> => {
  const contacts = await ports.listerLesContacts()
  const { anonymises, rattaches } = contactsAReconcilier(contacts)
  const orphelins = orphelinsParmi(
    rattaches,
    await inscritsVivantsParmi(comptesRattaches(rattaches)),
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
