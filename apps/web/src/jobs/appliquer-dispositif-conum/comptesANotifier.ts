/**
 * Ce que le job envoie à Brevo pour un passage, et si la borne de volume s'applique.
 *
 * - `contactsComplets` : comptes dont une affectation a bougé — contact entier (`updateBrevoContact`).
 *   Au-delà de la borne, on s'abstient : une salve inattendue trahit un rechargement massif plutôt
 *   que de vraies transitions. Comportement identique chaque nuit, import idposte ou non.
 * - `datesContrat` : la nuit qui suit un import idposte, tous les comptes liés à un contrat — dates
 *   de contrat SEULES. L'ETL recharge `main.contrat` en entier, aucun horodatage ne dit quel contrat
 *   a changé : la salve est attendue, donc non bornée. Un compte déjà envoyé en entier en est
 *   retiré (le contact complet porte déjà ses dates).
 */
export const comptesANotifier = ({
  impactes,
  avecContrat,
  importTermine,
  limite,
  forcer,
}: {
  impactes: readonly string[]
  avecContrat: readonly string[]
  importTermine: boolean
  limite: number
  forcer: boolean
}): { contactsComplets: string[]; datesContrat: string[]; borne: boolean } => {
  const borne = impactes.length > limite && !forcer
  const contactsComplets = borne ? [] : [...impactes]

  const dejaComplets = new Set(contactsComplets)
  const datesContrat = importTermine
    ? avecContrat.filter((userId) => !dejaComplets.has(userId))
    : []

  return { contactsComplets, datesContrat, borne }
}
