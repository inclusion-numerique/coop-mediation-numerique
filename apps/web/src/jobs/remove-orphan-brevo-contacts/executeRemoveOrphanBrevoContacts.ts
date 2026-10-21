import { output } from '@app/cli/output'
import { deploymentCanCreateBrevoContact } from '@app/web/external-apis/brevo/createBrevoContact'
import {
  contactsBrevoPorts,
  retirerLesContactsOrphelins,
} from '@app/web/features/utilisateurs/abilities/retirer-les-contacts-orphelins'

export const executeRemoveOrphanBrevoContacts = async () => {
  if (!deploymentCanCreateBrevoContact()) {
    output('Skipping reconciliation - not on main deployment')
    return { skipped: true }
  }

  const bilan = await retirerLesContactsOrphelins(contactsBrevoPorts)

  output(
    `Réconciliation Brevo : ${bilan.contacts} contacts, ${bilan.anonymisesSupprimes} anonymisés supprimés, ${bilan.orphelinsRetires} orphelins retirés, ${bilan.echecs.length} échecs`,
  )

  return bilan
}
