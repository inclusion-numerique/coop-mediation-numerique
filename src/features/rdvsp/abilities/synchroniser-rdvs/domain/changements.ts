import type { Lieu } from '../../../domain/rdv/lieu'
import type { Motif } from '../../../domain/rdv/motif'
import type { Participation } from '../../../domain/rdv/participation'
import type { Rdv } from '../../../domain/rdv/rdv'
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

const lieuDesigneModifie = (connu: Lieu | null, recu: Lieu | null): boolean => {
  if (connu === null || recu === null) {
    return connu !== recu
  }

  return lieuModifie(connu, recu)
}
