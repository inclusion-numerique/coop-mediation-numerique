import type { SchemaLieuMediationNumerique } from '@gouvfr-anct/lieux-de-mediation-numerique'
import type { LieuDataspaceResponse } from './LieuDataspaceResponse'

export const toLieuStandardMediationNumerique = (
  lieu: LieuDataspaceResponse,
): SchemaLieuMediationNumerique => ({
  id: lieu.id,
  nom: lieu.nom,
  pivot: lieu.pivot,
  adresse: [
    [lieu.adresse.numero_voie, lieu.adresse.repetition]
      .filter(Boolean)
      .join(''),
    lieu.adresse.nom_voie,
  ].join(' '),
  commune: lieu.adresse.commune,
  code_postal: lieu.adresse.code_postal,
  code_insee: lieu.adresse.code_insee,
  complement_adresse: lieu.complement_adresse,
  latitude: lieu.latitude ?? 0,
  longitude: lieu.longitude ?? 0,
  telephone: lieu.telephone,
  courriels: lieu.courriels,
  site_web: lieu.site_web,
  horaires: lieu.horaires,
  date_maj: lieu.date_maj,
  source: lieu.source,
  presentation_resume: lieu.presentation_resume,
  presentation_detail: lieu.presentation_detail,
  services: lieu.services?.join('|'),
  publics_specifiquement_adresses:
    lieu.publics_specifiquement_adresses?.join('|'),
  prise_en_charge_specifique: lieu.prise_en_charge_specifique?.join('|'),
  frais_a_charge: lieu.frais_a_charge?.join('|'),
  dispositif_programmes_nationaux:
    lieu.dispositif_programmes_nationaux?.join('|'),
  formations_labels: lieu.formations_labels?.join('|'),
  itinerance: lieu.itinerance?.join('|'),
  typologie: lieu.typologie?.join('|'),
  autres_formations_labels: lieu.autres_formations_labels?.join('|'),
  modalites_acces: lieu.modalites_acces?.join('|'),
  modalites_accompagnement: lieu.modalites_accompagnement?.join('|'),
  fiche_acces_libre: lieu.fiche_acces_libre,
  prise_rdv: lieu.prise_rdv,
  structure_parente: lieu.structure_parente,
})
