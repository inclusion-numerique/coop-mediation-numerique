import { appendComment } from '@app/web/opening-hours/openingHoursHelpers'
import { Nom } from '@gouvfr-anct/lieux-de-mediation-numerique'
import {
  fromTimetableOpeningHours,
  type Schedule,
} from '@gouvfr-anct/timetable-to-osm-opening-hours'
import { BanId } from '../../../domain/ban-id'
import { NomUsage } from '../../../domain/identite-sirene'
import {
  adresseSaisie,
  courrielsSaisis,
  itineranceSaisie,
  localisationSaisie,
  modalitesAccesSaisies,
  nonVide,
  pivotSaisi,
  presentationSaisie,
  sitesWebSaisis,
  telephoneSaisi,
  urlSaisie,
} from '../../../domain/saisie'
import { VisibiliteCartographie } from '../../../domain/visibilite-cartographie'
import type { ModificationLieu } from '../domain/modification-lieu'
import type { SaisieDeSection } from './modifier-la-fiche-du-lieu.validation'

const horairesOsm = (
  openingHours: Schedule,
  commentaire: string | null | undefined,
): string | null => {
  const osm = appendComment(
    fromTimetableOpeningHours(openingHours),
    nonVide(commentaire),
  ).trim()

  return osm === '' ? null : osm
}

type Saisie<Section extends SaisieDeSection['section']> = Extract<
  SaisieDeSection,
  { section: Section }
>

type Modification<Section extends SaisieDeSection['section']> = Extract<
  ModificationLieu,
  { section: Section }
>

const informationsGenerales = (
  saisie: Saisie<'InformationsGenerales'>,
): Modification<'InformationsGenerales'> => {
  const immatriculation = pivotSaisi(saisie.siret, saisie.rna)

  return {
    section: 'InformationsGenerales',
    nom: Nom(saisie.nom),
    adresse: adresseSaisie(saisie.adresseBan, saisie.complementAdresse),
    localisation: localisationSaisie(saisie.adresseBan),
    banId: BanId.safe(saisie.adresseBan.id),
    itinerance: itineranceSaisie(saisie.lieuItinerant),
    typologies: saisie.typologies,
    pivot: immatriculation,
    // Le nom d'usage vient de SIRENE : sans immatriculation, il n'a plus d'objet.
    nomUsage:
      immatriculation == null ? null : NomUsage.safe(saisie.nomUsage ?? ''),
  }
}

const visibiliteCartographie = (
  saisie: Saisie<'VisibiliteCartographie'>,
): Modification<'VisibiliteCartographie'> => ({
  section: 'VisibiliteCartographie',
  visibilite: VisibiliteCartographie(
    saisie.visiblePourCartographieNationale ? 'Publie' : 'NonPublie',
  ),
})

const informationsPratiques = (
  saisie: Saisie<'InformationsPratiques'>,
): Modification<'InformationsPratiques'> => ({
  section: 'InformationsPratiques',
  sitesWeb: sitesWebSaisis(saisie.siteWeb),
  ficheAccesLibre: urlSaisie(saisie.ficheAccesLibre),
  priseRdv: urlSaisie(saisie.priseRdv),
  horaires: horairesOsm(saisie.openingHours, saisie.horairesComment),
})

const description = (
  saisie: Saisie<'Description'>,
): Modification<'Description'> => ({
  section: 'Description',
  presentation: presentationSaisie(
    saisie.presentationResume,
    saisie.presentationDetail,
  ),
  formationsLabels: saisie.formationsLabels,
})

const servicesEtAccompagnement = (
  saisie: Saisie<'ServicesEtAccompagnement'>,
): Modification<'ServicesEtAccompagnement'> => ({
  section: 'ServicesEtAccompagnement',
  services: saisie.services,
  modalitesAccompagnement: saisie.modalitesAccompagnement,
})

const modalitesAccesAuService = (
  saisie: Saisie<'ModalitesAccesAuService'>,
): Modification<'ModalitesAccesAuService'> => ({
  section: 'ModalitesAccesAuService',
  modalitesAcces: modalitesAccesSaisies(saisie),
  telephone: telephoneSaisi(saisie.parTelephone, saisie.numeroTelephone),
  courriels: courrielsSaisis(saisie.parMail, saisie.adresseMail),
  fraisACharge: saisie.fraisACharge,
})

const typesDePublicsAccueillis = (
  saisie: Saisie<'TypesDePublicsAccueillis'>,
): Modification<'TypesDePublicsAccueillis'> => ({
  section: 'TypesDePublicsAccueillis',
  publicsSpecifiquementAdresses: saisie.toutPublic
    ? []
    : saisie.publicsSpecifiquementAdresses,
  priseEnChargeSpecifique: saisie.priseEnChargeSpecifique,
})

const parSection: {
  [Section in SaisieDeSection['section']]: (
    saisie: Saisie<Section>,
  ) => Modification<Section>
} = {
  InformationsGenerales: informationsGenerales,
  VisibiliteCartographie: visibiliteCartographie,
  InformationsPratiques: informationsPratiques,
  Description: description,
  ServicesEtAccompagnement: servicesEtAccompagnement,
  ModalitesAccesAuService: modalitesAccesAuService,
  TypesDePublicsAccueillis: typesDePublicsAccueillis,
}

export const depuisLaSaisie = <Section extends SaisieDeSection['section']>(
  saisie: Saisie<Section>,
): Modification<Section> => parSection[saisie.section](saisie)
