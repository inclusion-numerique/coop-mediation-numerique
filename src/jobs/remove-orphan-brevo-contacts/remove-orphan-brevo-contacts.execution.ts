import { brevoActif } from '@/configuration/brevo'
import { retirerLesContactsOrphelins } from '@/features/utilisateurs/abilities/retirer-les-contacts-orphelins/implementations/retirer-les-contacts-orphelins.binding'
import { output } from '@/libraries/console'

export const executeRemoveOrphanBrevoContacts = async () => {
  if (!brevoActif()) {
    output('Skipping reconciliation - not on main deployment')
    return { skipped: true }
  }

  const bilan = await retirerLesContactsOrphelins()

  output(
    `Réconciliation Brevo : ${bilan.contacts} contacts, ${bilan.anonymisesSupprimes} anonymisés supprimés, ${bilan.orphelinsRetires} orphelins retirés, ${bilan.echecs.length} échecs`,
  )

  return bilan
}
