import { retirerLesContactsOrphelins as retirer } from '../domain/retirer-les-contacts-orphelins'
import { contactsBrevoPorts } from './brevo/contacts-brevo.query'
import { inscritsVivantsParmi } from './prisma/inscrits-vivants.query'

export const retirerLesContactsOrphelins = retirer({
  ...contactsBrevoPorts,
  inscritsVivantsParmi,
})
