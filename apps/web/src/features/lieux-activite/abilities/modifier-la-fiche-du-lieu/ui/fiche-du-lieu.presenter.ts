import { safeToTimetableOpeningHours } from '@app/web/components/structure/fields/openingHoursHelpers'
import type { AdresseBanData } from '@app/web/external-apis/ban/AdresseBanValidation'
import { getAdresseBanLabel } from '@app/web/external-apis/ban/adresseBanLabel'
import { banDefaultValueToAdresseBanData } from '@app/web/external-apis/ban/banDefaultValueToAdresseBanData'
import type { StructureSearchResult } from '@app/web/features/employeuse'
import { getDepartementCodeFromCodeInsee } from '@app/web/utils/getDepartementFromCodeInsee'
import {
  Itinerance,
  isSiret,
  ModaliteAcces,
} from '@gouvfr-anct/lieux-de-mediation-numerique'
import {
  CLOSED_SCHEDULE,
  type Schedule,
} from '@gouvfr-anct/timetable-to-osm-opening-hours'
import type {
  FormationLabel as PrismaFormationLabel,
  FraisACharge as PrismaFraisACharge,
  ModaliteAccompagnement as PrismaModaliteAccompagnement,
  PriseEnChargeSpecifique as PrismaPriseEnChargeSpecifique,
  PublicSpecifiquementAdresse as PrismaPublicSpecifiquementAdresse,
  Service as PrismaService,
  Typologie as PrismaTypologie,
} from '@prisma/client'
import type { Lieu } from '../../../domain/lieu'
import { estPublie } from '../../../domain/visibilite-cartographie'
import * as vocabulaire from '../../../vocabulaire'
import type { FicheDuLieu } from '../implementation'

/**
 * La mise en forme de la fiche pour l'écran : domaine vers props, sans effet et
 * sans JSX. Les composants n'ont ainsi rien à décider.
 *
 * Le vocabulaire redescend en noms Prisma parce que c'est sous ces noms que les
 * listes de libellés et d'options de la coop sont indexées. La traduction reste
 * celle du transfer — il n'en existe qu'une.
 */
export type FicheAffichee = {
  readonly id: string
  readonly nom: string
  readonly misAJourLe: Date
  readonly misAJourPar: string | null
  readonly publieSurLaCartographie: boolean
  readonly connuDeLaCartographie: boolean
  /** Le département du lieu, dont dépendent les liens de l'annuaire. */
  readonly departementCode: string
  readonly informationsGenerales: {
    readonly nom: string
    readonly adresse: string | null
    readonly commune: string | null
    readonly codePostal: string | null
    readonly codeInsee: string | null
    readonly complementAdresse: string | null
    readonly latitude: number | null
    readonly longitude: number | null
    readonly banId: string | null
    /** L'adresse dans la forme que le champ de recherche BAN sait relire. */
    readonly adresseBan: AdresseBanData
    readonly siretSearch: StructureSearchResult | null
    readonly lieuItinerant: boolean | null
    readonly typologies: readonly PrismaTypologie[]
    readonly siret: string | null
    readonly rna: string | null
    readonly nomUsage: string | null
  }
  readonly informationsPratiques: {
    readonly siteWeb: string | null
    readonly sitesWeb: readonly string[]
    readonly ficheAccesLibre: string | null
    readonly priseRdv: string | null
    readonly horaires: string | null
    /** La chaîne OSM redevient une grille, et son commentaire un champ à part. */
    readonly openingHours: Schedule
    readonly horairesComment: string | null
    readonly estVide: boolean
  }
  readonly description: {
    readonly presentationResume: string | null
    readonly presentationDetail: string | null
    readonly formationsLabels: readonly PrismaFormationLabel[]
    readonly estVide: boolean
  }
  readonly servicesEtAccompagnement: {
    readonly services: readonly PrismaService[]
    readonly modalitesAccompagnement: readonly PrismaModaliteAccompagnement[]
    readonly estVide: boolean
  }
  readonly modalitesAccesAuService: {
    readonly surPlace: boolean
    readonly parTelephone: boolean
    readonly numeroTelephone: string | null
    readonly parMail: boolean
    readonly adresseMail: string | null
    readonly fraisACharge: readonly PrismaFraisACharge[]
    readonly estVide: boolean
  }
  readonly typesDePublicsAccueillis: {
    readonly toutPublic: boolean
    readonly publicsSpecifiquementAdresses: readonly PrismaPublicSpecifiquementAdresse[]
    readonly priseEnChargeSpecifique: readonly PrismaPriseEnChargeSpecifique[]
    readonly estVide: boolean
  }
}

const SEPARATEUR_LISTE = '|'

const itinerant = (itinerance: Lieu['fiche']['itinerance']): boolean | null =>
  itinerance.length === 0 ? null : itinerance.includes(Itinerance.Itinerant)

const DEPARTEMENT_PAR_DEFAUT = '75'

const commentaireDesHoraires = (horaires: string | null): string | null =>
  horaires?.match(/".+"/g)?.toString().replaceAll('"', '') ?? null

const adresseBanDepuis = (fiche: Lieu['fiche']): AdresseBanData => {
  const adresse = banDefaultValueToAdresseBanData({
    codeInsee: fiche.adresse?.code_insee,
    codePostal: fiche.adresse?.code_postal ?? '',
    commune: fiche.adresse?.commune ?? '',
    nom: fiche.adresse?.voie ?? '',
    latitude: fiche.localisation?.latitude,
    longitude: fiche.localisation?.longitude,
  })

  return { ...adresse, label: getAdresseBanLabel(adresse) }
}

const rechercheSiret = (fiche: Lieu['fiche']): StructureSearchResult | null =>
  fiche.pivot != null && isSiret(fiche.pivot)
    ? {
        siret: fiche.pivot,
        nom: fiche.nom,
        adresse: fiche.adresse?.voie ?? '',
        commune: fiche.adresse?.commune ?? '',
        codePostal: fiche.adresse?.code_postal ?? '',
        codeInsee: fiche.adresse?.code_insee ?? '',
        source: 'database',
      }
    : null

export const ficheAffichee = ({
  lieu,
  auteurDerniereModification,
}: FicheDuLieu): FicheAffichee => {
  const { fiche } = lieu
  const contact = fiche.contact
  const courriel = contact.courriels?.[0] ?? null
  const sitesWeb = contact.site_web ?? []

  return {
    id: lieu.id,
    nom: fiche.nom,
    misAJourLe: lieu.tracabilite.derniereModification.date,
    misAJourPar: auteurDerniereModification,
    publieSurLaCartographie: estPublie(lieu.visibilite),
    connuDeLaCartographie: lieu.idsCartographieNationale != null,
    departementCode:
      fiche.adresse?.code_insee == null
        ? DEPARTEMENT_PAR_DEFAUT
        : getDepartementCodeFromCodeInsee(fiche.adresse.code_insee),
    informationsGenerales: {
      nom: fiche.nom,
      adresse: fiche.adresse?.voie ?? null,
      commune: fiche.adresse?.commune ?? null,
      codePostal: fiche.adresse?.code_postal ?? null,
      codeInsee: fiche.adresse?.code_insee ?? null,
      complementAdresse: fiche.adresse?.complement_adresse ?? null,
      latitude: fiche.localisation?.latitude ?? null,
      longitude: fiche.localisation?.longitude ?? null,
      banId: lieu.banId,
      adresseBan: adresseBanDepuis(fiche),
      siretSearch: rechercheSiret(fiche),
      lieuItinerant: itinerant(fiche.itinerance),
      typologies: vocabulaire.traduites(
        fiche.typologies,
        vocabulaire.typologie.versCoop,
      ),
      siret: fiche.pivot != null && isSiret(fiche.pivot) ? fiche.pivot : null,
      rna: fiche.pivot != null && !isSiret(fiche.pivot) ? fiche.pivot : null,
      nomUsage: lieu.identiteSirene.nomUsage,
    },
    informationsPratiques: {
      siteWeb: sitesWeb.length === 0 ? null : sitesWeb.join(SEPARATEUR_LISTE),
      sitesWeb: [...sitesWeb],
      ficheAccesLibre: fiche.ficheAccesLibre ?? null,
      priseRdv: fiche.priseRdv ?? null,
      horaires: fiche.horaires,
      openingHours:
        fiche.horaires == null
          ? CLOSED_SCHEDULE
          : safeToTimetableOpeningHours(new Date())(fiche.horaires),
      horairesComment: commentaireDesHoraires(fiche.horaires),
      estVide:
        sitesWeb.length === 0 &&
        fiche.ficheAccesLibre == null &&
        fiche.priseRdv == null &&
        fiche.horaires == null,
    },
    description: {
      presentationResume: fiche.presentation?.resume ?? null,
      presentationDetail: fiche.presentation?.detail ?? null,
      formationsLabels: vocabulaire.traduites(
        fiche.formationsLabels,
        vocabulaire.formationLabel.versCoop,
      ),
      estVide:
        fiche.presentation?.resume == null &&
        fiche.presentation?.detail == null,
    },
    servicesEtAccompagnement: {
      services: vocabulaire.traduites(
        fiche.services,
        vocabulaire.service.versCoop,
      ),
      modalitesAccompagnement: vocabulaire.traduites(
        fiche.modalitesAccompagnement,
        vocabulaire.modaliteAccompagnement.versCoop,
      ),
      estVide:
        fiche.services.length === 0 &&
        fiche.modalitesAccompagnement.length === 0,
    },
    modalitesAccesAuService: {
      surPlace: fiche.modalitesAcces.includes(ModaliteAcces.SePresenter),
      parTelephone: fiche.modalitesAcces.includes(ModaliteAcces.Telephoner),
      numeroTelephone: contact.telephone ?? null,
      parMail: fiche.modalitesAcces.includes(ModaliteAcces.ContacterParMail),
      adresseMail: courriel,
      fraisACharge: vocabulaire.traduites(
        fiche.fraisACharge,
        vocabulaire.fraisACharge.versCoop,
      ),
      estVide:
        fiche.modalitesAcces.length === 0 && fiche.fraisACharge.length === 0,
    },
    typesDePublicsAccueillis: {
      // « Tout public » n'est pas une colonne : c'est l'absence de public visé.
      toutPublic: fiche.publicsSpecifiquementAdresses.length === 0,
      publicsSpecifiquementAdresses: vocabulaire.traduites(
        fiche.publicsSpecifiquementAdresses,
        vocabulaire.publicSpecifiquementAdresse.versCoop,
      ),
      priseEnChargeSpecifique: vocabulaire.traduites(
        fiche.priseEnChargeSpecifique,
        vocabulaire.priseEnChargeSpecifique.versCoop,
      ),
      estVide:
        fiche.publicsSpecifiquementAdresses.length === 0 &&
        fiche.priseEnChargeSpecifique.length === 0,
    },
  }
}
