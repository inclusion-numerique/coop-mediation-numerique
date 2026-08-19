import type { Lieu } from '../../../domain/lieu'
import type { Motif } from '../../../domain/motif'
import type { Participation } from '../../../domain/participation'
import type { Rdv } from '../../../domain/rdv'
import type { Usager } from '../../../domain/usager'

export const motifModifie = (connu: Motif, recu: Motif): boolean =>
  connu.nom !== recu.nom ||
  connu.collectif !== recu.collectif ||
  connu.organisationId !== recu.organisationId ||
  connu.suivi !== recu.suivi ||
  connu.instruction !== recu.instruction ||
  connu.typeDeLieu !== recu.typeDeLieu ||
  connu.categorieId !== recu.categorieId

export const lieuModifie = (connu: Lieu, recu: Lieu): boolean =>
  connu.nom !== recu.nom ||
  connu.adresse !== recu.adresse ||
  connu.telephone !== recu.telephone ||
  connu.usageUnique !== recu.usageUnique ||
  connu.organisationId !== recu.organisationId

/**
 * Seule l'identité est comparée. Le reste de la fiche — coordonnées, préférences
 * de notification — appartient à RDV Service Public et change sans que La Coop
 * ait à s'en émouvoir : réécrire l'usager à chaque variation de ces champs
 * ferait remonter des « mises à jour » qui n'en sont pas.
 */
export const usagerModifie = (connu: Usager, recu: Usager): boolean =>
  connu.prenom !== recu.prenom ||
  connu.nom !== recu.nom ||
  connu.email !== recu.email

const participationModifiee = (
  connue: Participation,
  recue: Participation,
): boolean =>
  connue.statutPresence !== recue.statutPresence ||
  connue.usagerId !== recue.usagerId

const participationsModifiees = (
  connues: readonly Participation[],
  recues: readonly Participation[],
): boolean => {
  if (connues.length !== recues.length) {
    return true
  }

  const recuesParId = new Map(recues.map((recue) => [recue.id, recue]))

  return connues.some((connue) => {
    const recue = recuesParId.get(connue.id)
    return recue === undefined || participationModifiee(connue, recue)
  })
}

const nomAtelier = (rdv: Rdv): string | null => (rdv.collectif ? rdv.nom : null)

/**
 * Un rendez-vous a changé si l'un de ses attributs propres a bougé, si son
 * rattachement à un motif, un lieu ou une organisation a changé, si le
 * paramétrage du lieu qu'il désigne a été retouché, ou si ses participations
 * diffèrent.
 *
 * L'organisation n'est pas comparée dans le détail, contrairement à l'ancienne
 * version : ses champs vivent dans sa propre table, réconciliée par
 * `synchroniser-organisations`. Les comparer ici faisait passer un rendez-vous
 * pour modifié parce que le numéro de téléphone de sa structure avait changé.
 */
export const rdvModifie = (connu: Rdv, recu: Rdv): boolean =>
  connu.statutPresence !== recu.statutPresence ||
  connu.duree !== recu.duree ||
  nomAtelier(connu) !== nomAtelier(recu) ||
  connu.debut.getTime() !== recu.debut.getTime() ||
  connu.fin.getTime() !== recu.fin.getTime() ||
  connu.organisationId !== recu.organisationId ||
  (connu.motif?.id ?? null) !== (recu.motif?.id ?? null) ||
  (connu.lieu?.id ?? null) !== (recu.lieu?.id ?? null) ||
  lieuDesigneModifie(connu.lieu, recu.lieu) ||
  participationsModifiees(connu.participations, recu.participations)

/**
 * Le rendez-vous porte une copie dénormalisée de son lieu : on la compare pour
 * ne pas laisser un lieu retouché derrière un rendez-vous par ailleurs identique.
 */
const lieuDesigneModifie = (connu: Lieu | null, recu: Lieu | null): boolean => {
  if (connu === null || recu === null) {
    return connu !== recu
  }

  return lieuModifie(connu, recu)
}
