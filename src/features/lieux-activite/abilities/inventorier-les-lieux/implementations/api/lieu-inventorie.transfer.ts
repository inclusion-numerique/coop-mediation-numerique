export type StructureAttributes = {
  id_pg: number | null
  structure_cartographie_nationale_id: string | null
  creation: string
  modification: string
  suppression: string | null
  nom: string
  adresse: string
  commune: string
  code_postal: string
  code_insee: string | null
  complement_adresse: string | null
  latitude: number | null
  longitude: number | null
  siret: string | null
  rna: string | null
  visible_pour_cartographie_nationale: boolean
  typologies: string[]
  presentation_resume: string | null
  presentation_detail: string | null
  site_web: string | null
  telephone: string | null
  courriels: string[]
  fiche_acces_libre: string | null
  horaires: string | null
  prise_rdv: string | null
  services: string[]
  publics_specifiquement_adresses: string[]
  prise_en_charge_specifique: string[]
  frais_a_charge: string[]
  dispositif_programmes_nationaux: string[]
  formations_labels: string[]
  autres_formations_labels: string[]
  itinerance: string[]
  modalites_acces: string[]
  modalites_accompagnement: string[]
  mediateurs_en_activite: number
  emplois: number
}

type LieuAExposer = {
  readonly v1StructureIdPg: number | null
  readonly structureCartographieNationaleId: string | null
  readonly creation: Date
  readonly modification: Date
  readonly suppression: Date | null
  readonly nom: string
  readonly adresse: string
  readonly commune: string
  readonly codePostal: string
  readonly codeInsee: string | null
  readonly complementAdresse: string | null
  readonly latitude: number | null
  readonly longitude: number | null
  readonly siret: string | null
  readonly rna: string | null
  readonly visiblePourCartographieNationale: boolean
  readonly typologies: readonly string[]
  readonly presentationResume: string | null
  readonly presentationDetail: string | null
  readonly siteWeb: string | null
  readonly telephone: string | null
  readonly courriels: string[]
  readonly ficheAccesLibre: string | null
  readonly horaires: string | null
  readonly priseRdv: string | null
  readonly services: readonly string[]
  readonly publicsSpecifiquementAdresses: readonly string[]
  readonly priseEnChargeSpecifique: readonly string[]
  readonly fraisACharge: readonly string[]
  readonly dispositifProgrammesNationaux: readonly string[]
  readonly formationsLabels: readonly string[]
  readonly autresFormationsLabels: string[]
  readonly itinerance: readonly string[]
  readonly modalitesAcces: readonly string[]
  readonly modalitesAccompagnement: readonly string[]
  readonly _count: { readonly mediateursEnActivite: number }
}

export const lieuInventorie = (lieu: LieuAExposer): StructureAttributes => ({
  id_pg: lieu.v1StructureIdPg,
  structure_cartographie_nationale_id: lieu.structureCartographieNationaleId,
  creation: lieu.creation.toISOString(),
  modification: lieu.modification.toISOString(),
  suppression: lieu.suppression ? lieu.suppression.toISOString() : null,
  nom: lieu.nom,
  adresse: lieu.adresse,
  commune: lieu.commune,
  code_postal: lieu.codePostal,
  code_insee: lieu.codeInsee,
  complement_adresse: lieu.complementAdresse,
  latitude: lieu.latitude,
  longitude: lieu.longitude,
  siret: lieu.siret,
  rna: lieu.rna,
  visible_pour_cartographie_nationale: lieu.visiblePourCartographieNationale,
  typologies: [...lieu.typologies],
  presentation_resume: lieu.presentationResume,
  presentation_detail: lieu.presentationDetail,
  site_web: lieu.siteWeb,
  telephone: lieu.telephone,
  courriels: lieu.courriels,
  fiche_acces_libre: lieu.ficheAccesLibre,
  horaires: lieu.horaires,
  prise_rdv: lieu.priseRdv,
  services: [...lieu.services],
  publics_specifiquement_adresses: [...lieu.publicsSpecifiquementAdresses],
  prise_en_charge_specifique: [...lieu.priseEnChargeSpecifique],
  frais_a_charge: [...lieu.fraisACharge],
  dispositif_programmes_nationaux: [...lieu.dispositifProgrammesNationaux],
  formations_labels: [...lieu.formationsLabels],
  autres_formations_labels: lieu.autresFormationsLabels,
  itinerance: [...lieu.itinerance],
  modalites_acces: [...lieu.modalitesAcces],
  modalites_accompagnement: [...lieu.modalitesAccompagnement],
  mediateurs_en_activite: lieu._count.mediateursEnActivite,
  emplois: 0,
})
