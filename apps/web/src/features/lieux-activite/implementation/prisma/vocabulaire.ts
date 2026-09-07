import {
  DispositifProgrammeNational,
  FormationLabel,
  Frais,
  Itinerance,
  ModaliteAcces,
  ModaliteAccompagnement,
  PriseEnChargeSpecifique,
  PublicSpecifiquementAdresse,
  Service,
  Typologie,
} from '@gouvfr-anct/lieux-de-mediation-numerique'

const pont = <Standard extends string, Coop extends string>(
  _standard: Record<string, Standard>,
  table: Record<Coop, Standard>,
) => {
  const inverse = new Map<Standard, Coop>(
    Object.entries(table).map(([coop, standard]) => [
      standard as Standard,
      coop as Coop,
    ]),
  )

  return {
    table,
    versStandard: (valeur: Coop): Standard => table[valeur],
    versCoop: (valeur: Standard): Coop | null => inverse.get(valeur) ?? null,
  }
}

export const traduites = <Depuis, Vers>(
  valeurs: readonly Depuis[],
  traduction: (valeur: Depuis) => Vers | null,
): readonly Vers[] =>
  valeurs
    .map(traduction)
    .filter((valeur): valeur is NonNullable<Vers> => valeur != null)

export const service = pont(Service, {
  AideAuxDemarchesAdministratives: Service.AideAuxDemarchesAdministratives,
  MaitriseDesOutilsNumeriquesDuQuotidien:
    Service.MaitriseDesOutilsNumeriquesDuQuotidien,
  InsertionProfessionnelleViaLeNumerique:
    Service.InsertionProfessionnelleViaLeNumerique,
  AcquisitionDeMaterielInformatiqueAPrixSolidaire:
    Service.MaterielInformatiqueAPrixSolidaire,
  UtilisationSecuriseeDuNumerique: Service.UtilisationSecuriseeDuNumerique,
  ParentaliteEtEducationAvecLeNumerique:
    Service.ParentaliteEtEducationAvecLeNumerique,
  LoisirsEtCreationsNumeriques: Service.LoisirsEtCreationsNumeriques,
  ComprehensionDuMondeNumerique: Service.ComprehensionDuMondeNumerique,
  AccesInternetEtMaterielInformatique:
    Service.AccesInternetEtMaterielInformatique,
})

export type ServiceCoop = keyof typeof service.table

export const modaliteAcces = pont(ModaliteAcces, {
  SePresenter: ModaliteAcces.SePresenter,
  Telephoner: ModaliteAcces.Telephoner,
  ContacterParMail: ModaliteAcces.ContacterParMail,
  PrendreRdvEnLigne: ModaliteAcces.PrendreRdvEnLigne,
  PasDePublic: ModaliteAcces.PasDePublic,
  FicheDePrescription: ModaliteAcces.PrescriptionParMail,
})

export type ModaliteAccesCoop = keyof typeof modaliteAcces.table

export const modaliteAccompagnement = pont(ModaliteAccompagnement, {
  EnAutonomie: ModaliteAccompagnement.EnAutonomie,
  AccompagnementIndividuel: ModaliteAccompagnement.AccompagnementIndividuel,
  DansUnAtelierCollectif: ModaliteAccompagnement.DansUnAtelier,
  ADistance: ModaliteAccompagnement.ADistance,
})

export type ModaliteAccompagnementCoop =
  keyof typeof modaliteAccompagnement.table

export const priseEnChargeSpecifique = pont(PriseEnChargeSpecifique, {
  Surdite: PriseEnChargeSpecifique.Surdite,
  HandicapsMoteurs: PriseEnChargeSpecifique.HandicapsMoteurs,
  HandicapsMentaux: PriseEnChargeSpecifique.HandicapsMentaux,
  Illettrisme: PriseEnChargeSpecifique.Illettrisme,
  LanguesEtrangeresAnglais: PriseEnChargeSpecifique.LanguesEtrangeresAnglais,
  LanguesEtrangeresAutre: PriseEnChargeSpecifique.LanguesEtrangeresAutre,
  DeficienceVisuelle: PriseEnChargeSpecifique.DeficienceVisuelle,
})

export type PriseEnChargeSpecifiqueCoop =
  keyof typeof priseEnChargeSpecifique.table

export const publicSpecifiquementAdresse = pont(PublicSpecifiquementAdresse, {
  Jeunes: PublicSpecifiquementAdresse.Jeunes,
  Etudiants: PublicSpecifiquementAdresse.Etudiants,
  FamillesEnfants: PublicSpecifiquementAdresse.FamillesEnfants,
  Seniors: PublicSpecifiquementAdresse.Seniors,
  Femmes: PublicSpecifiquementAdresse.Femmes,
})

export type PublicSpecifiquementAdresseCoop =
  keyof typeof publicSpecifiquementAdresse.table

export const dispositifProgrammeNational = pont(DispositifProgrammeNational, {
  AidantsConnect: DispositifProgrammeNational.AidantsConnect,
  BibliothequesNumeriqueDeReference:
    DispositifProgrammeNational.BibliothequesNumeriqueDeReference,
  CertificationPix: DispositifProgrammeNational.CertificationPIX,
  ConseillersNumeriques: DispositifProgrammeNational.ConseillersNumeriques,
  EmmausConnect: DispositifProgrammeNational.EmmausConnect,
  FranceServices: DispositifProgrammeNational.FranceServices,
  GrandeEcoleDuNumerique: DispositifProgrammeNational.GrandeEcoleDuNumerique,
  LaCroixRouge: DispositifProgrammeNational.LaCroixRouge,
  PointAccesNumeriqueCaf: DispositifProgrammeNational.PointNumeriqueCAF,
  PromeneursDuNet: DispositifProgrammeNational.PromeneursDuNet,
  RelaisNumeriqueEmmausConnect:
    DispositifProgrammeNational.RelaisNumeriqueEmmausConnect,
})

export type DispositifProgrammeNationalCoop =
  keyof typeof dispositifProgrammeNational.table

export const formationLabel = pont(FormationLabel, {
  FormeAMonEspaceSante: FormationLabel.FormeAMonEspaceSante,
  FormeADuplex: FormationLabel.FormeADuplex,
  ArniaMednum: FormationLabel.ArniaMednum,
  CollectifRessourcesEtActeursReemploi:
    FormationLabel.CollectifRessourcesEtActeursReemploi,
  FabriquesDeTerritoire: FormationLabel.FabriquesDeTerritoire,
  LesEclaireurs: FormationLabel.LesEclaireurs,
  MesPapiers: FormationLabel.MesPapiers,
  Ordi3: FormationLabel.Ordi3,
  SudLabs: FormationLabel.SudLabs,
})

export type FormationLabelCoop = keyof typeof formationLabel.table

export const fraisACharge = pont(Frais, {
  Gratuit: Frais.Gratuit,
  GratuitSousCondition: Frais.GratuitSousCondition,
  Payant: Frais.Payant,
})

export type FraisAChargeCoop = keyof typeof fraisACharge.table

export const itinerance = pont(Itinerance, {
  Itinerant: Itinerance.Itinerant,
  Fixe: Itinerance.Fixe,
})

export type ItineranceCoop = keyof typeof itinerance.table

export type TypologieCoop = `${Typologie}`

const typologieParValeur = new Map<string, Typologie>(
  Object.values(Typologie).map((valeur) => [valeur, valeur]),
)

export const typologie = {
  versStandard: (valeur: TypologieCoop): Typologie | null =>
    typologieParValeur.get(valeur) ?? null,
  versCoop: (valeur: Typologie): TypologieCoop => valeur,
}
