import { brevoActif } from '@/configuration/brevo'
import { retirerLesContactsOrphelins } from '@/features/utilisateurs/abilities/retirer-les-contacts-orphelins/domain/retirer-les-contacts-orphelins'
import { contactsBrevoPorts } from '@/features/utilisateurs/abilities/retirer-les-contacts-orphelins/implementations/brevo/contacts-brevo.query'
import { inscritsVivantsParmi } from '@/features/utilisateurs/abilities/retirer-les-contacts-orphelins/implementations/prisma/inscrits-vivants.query'
import { output } from '@/libraries/console'

export const executeRemoveOrphanBrevoContacts = async () => {
  if (!brevoActif()) {
    output('Skipping reconciliation - not on main deployment')
    return { skipped: true }
  }

  const bilan = await retirerLesContactsOrphelins({
    ...contactsBrevoPorts,
    inscritsVivantsParmi,
  })()

  output(
    `Réconciliation Brevo : ${bilan.contacts} contacts, ${bilan.anonymisesSupprimes} anonymisés supprimés, ${bilan.orphelinsRetires} orphelins retirés, ${bilan.echecs.length} échecs`,
  )

  return bilan
}
