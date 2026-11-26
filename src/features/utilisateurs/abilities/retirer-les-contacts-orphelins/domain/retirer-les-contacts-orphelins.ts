import type {
  AdresseCourriel,
  EchecTechnique,
} from '@/features/utilisateurs/domain'
import { type Result, success } from '@/libraries/result'
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
  readonly echecs: readonly AdresseCourriel[]
}

type Applications = {
  readonly faits: readonly AdresseCourriel[]
  readonly echecs: readonly AdresseCourriel[]
}

const appliquer = (
  courriels: readonly AdresseCourriel[],
  action: (
    courriel: AdresseCourriel,
  ) => Promise<Result<boolean, EchecTechnique>>,
): Promise<Applications> =>
  courriels.reduce<Promise<Applications>>(
    async (precedent, courriel) => {
      const bilan = await precedent
      const resultat = await action(courriel)
      if (!resultat.success)
        return { ...bilan, echecs: [...bilan.echecs, courriel] }
      return resultat.data
        ? { ...bilan, faits: [...bilan.faits, courriel] }
        : bilan
    },
    Promise.resolve({ faits: [], echecs: [] }),
  )

export const retirerLesContactsOrphelins =
  ({
    inscritsVivantsParmi,
    supprimerLeContact,
    retirerLeContactDeLaListe,
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

    const suppressions = await appliquer(anonymises, async (courriel) => {
      const suppression = await supprimerLeContact(courriel)
      return suppression.success ? success(true) : suppression
    })
    const retraits = await appliquer(orphelins, async (courriel) => {
      const retrait = await retirerLeContactDeLaListe(courriel)
      return retrait.success ? success(retrait.data._tag === 'Retire') : retrait
    })

    return success({
      contacts: contacts.length,
      anonymisesSupprimes: suppressions.faits,
      orphelinsRetires: retraits.faits,
      echecs: [...suppressions.echecs, ...retraits.echecs],
    })
  }
