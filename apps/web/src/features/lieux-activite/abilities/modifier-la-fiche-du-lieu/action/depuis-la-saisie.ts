import { appendComment } from '@app/web/components/structure/fields/openingHoursHelpers'
import { fixTelephone } from '@app/web/utils/clean-operations'
import {
  Adresse,
  Courriel,
  Itinerance,
  isRna,
  isSiret,
  isValidAddress,
  isValidCourriel,
  isValidLocalisation,
  isValidTelephone,
  isValidUrl,
  Localisation,
  ModaliteAcces,
  Nom,
  type Pivot,
  type Presentation,
  Url,
} from '@gouvfr-anct/lieux-de-mediation-numerique'
import {
  fromTimetableOpeningHours,
  type Schedule,
} from '@gouvfr-anct/timetable-to-osm-opening-hours'
import { vocabulaire } from '../../../db'
import { BanId } from '../../../domain/ban-id'
import { NomUsage } from '../../../domain/identite-sirene'
import { VisibiliteCartographie } from '../../../domain/visibilite-cartographie'
import type { ModificationLieu } from '../domain/modification-lieu'
import type { SaisieDeSection } from './modifier-la-fiche-du-lieu.validation'

/**
 * La grille hebdomadaire redevient la chaîne OpenStreetMap que porte la colonne,
 * commentaire compris. Une semaine entièrement fermée ne vaut pas la peine
 * d'être écrite : elle devient une absence d'horaires.
 */
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

/** Le séparateur multi-valeurs du schéma national. */
const SEPARATEUR_LISTE = '|'

const nonVide = (valeur: string | null | undefined): string | null =>
  valeur != null && valeur.trim() !== '' ? valeur.trim() : null

const url = (valeur: string | null | undefined): Url | null => {
  const texte = nonVide(valeur)

  return texte != null && isValidUrl(texte) ? Url(texte) : null
}

const sitesWeb = (valeur: string | null | undefined): readonly Url[] =>
  (nonVide(valeur) ?? '')
    .split(SEPARATEUR_LISTE)
    .map((jeton) => jeton.trim())
    .filter(isValidUrl)
    .map(Url)

const pivot = (
  siret: string | null | undefined,
  rna: string | null | undefined,
): Pivot | null => {
  const siretSaisi = nonVide(siret)
  if (siretSaisi != null && isSiret(siretSaisi)) return siretSaisi

  const rnaSaisi = nonVide(rna)

  return rnaSaisi != null && isRna(rnaSaisi) ? rnaSaisi : null
}

const presentation = (
  resume: string | null | undefined,
  detail: string | null | undefined,
): Presentation | null => {
  const resumeSaisi = nonVide(resume)
  const detailSaisi = nonVide(detail)

  if (resumeSaisi == null && detailSaisi == null) return null

  return {
    ...(resumeSaisi == null ? {} : { resume: resumeSaisi }),
    ...(detailSaisi == null ? {} : { detail: detailSaisi }),
  }
}

const telephone = (
  parTelephone: boolean,
  numero: string | null | undefined,
): string | null => {
  if (!parTelephone) return null

  const saisi = nonVide(numero)
  const normalise = saisi == null ? null : fixTelephone(saisi)

  return normalise != null && isValidTelephone(normalise) ? normalise : null
}

const courriels = (
  parMail: boolean,
  adresse: string | null | undefined,
): readonly Courriel[] => {
  const saisie = parMail ? nonVide(adresse) : null

  return saisie != null && isValidCourriel(saisie) ? [Courriel(saisie)] : []
}

const modalitesAcces = (saisie: {
  surPlace: boolean
  parTelephone: boolean
  parMail: boolean
}): readonly ModaliteAcces[] => [
  ...(saisie.surPlace ? [ModaliteAcces.SePresenter] : []),
  ...(saisie.parTelephone ? [ModaliteAcces.Telephoner] : []),
  ...(saisie.parMail ? [ModaliteAcces.ContacterParMail] : []),
]

/**
 * La saisie devient un modèle du domaine, ou rien : c'est ici, à la frontière,
 * que le parsing a lieu. Ce que le schéma national refuse — une adresse
 * incomplète, une URL qui n'en est pas une — est écarté plutôt que porté plus
 * loin sous une forme douteuse.
 */
export const depuisLaSaisie = (saisie: SaisieDeSection): ModificationLieu => {
  // Un `default` ferait taire le contrôle d'exhaustivité de TypeScript, qui est
  // justement ce qui garantit qu'une section ajoutée sera traitée ici.
  // biome-ignore lint/style/useDefaultSwitchClause: l'union est exhaustive
  switch (saisie.section) {
    case 'InformationsGenerales': {
      const candidate = {
        voie: saisie.adresseBan.nom,
        commune: saisie.adresseBan.commune,
        code_postal: saisie.adresseBan.codePostal,
        code_insee: saisie.adresseBan.codeInsee,
        ...(nonVide(saisie.complementAdresse) == null
          ? {}
          : { complement_adresse: saisie.complementAdresse?.trim() }),
      }
      const localisation = {
        latitude: saisie.adresseBan.latitude,
        longitude: saisie.adresseBan.longitude,
      }
      const immatriculation = pivot(saisie.siret, saisie.rna)

      return {
        section: 'InformationsGenerales',
        nom: Nom(saisie.nom),
        adresse: isValidAddress(candidate) ? Adresse(candidate) : null,
        localisation: isValidLocalisation(localisation)
          ? Localisation(localisation)
          : null,
        banId: BanId.safe(saisie.adresseBan.id),
        itinerance:
          saisie.lieuItinerant == null
            ? []
            : saisie.lieuItinerant
              ? [Itinerance.Itinerant]
              : [Itinerance.Fixe],
        typologies: vocabulaire.traduites(
          saisie.typologies,
          vocabulaire.typologie.versStandard,
        ),
        pivot: immatriculation,
        // Le nom d'usage vient de SIRENE : sans immatriculation, il n'a plus
        // d'objet.
        nomUsage:
          immatriculation == null ? null : NomUsage.safe(saisie.nomUsage ?? ''),
      }
    }
    case 'VisibiliteCartographie':
      return {
        section: 'VisibiliteCartographie',
        visibilite: VisibiliteCartographie(
          saisie.visiblePourCartographieNationale ? 'Publie' : 'NonPublie',
        ),
      }
    case 'InformationsPratiques':
      return {
        section: 'InformationsPratiques',
        sitesWeb: sitesWeb(saisie.siteWeb),
        ficheAccesLibre: url(saisie.ficheAccesLibre),
        priseRdv: url(saisie.priseRdv),
        horaires: horairesOsm(saisie.openingHours, saisie.horairesComment),
      }
    case 'Description':
      return {
        section: 'Description',
        presentation: presentation(
          saisie.presentationResume,
          saisie.presentationDetail,
        ),
        formationsLabels: vocabulaire.traduites(
          saisie.formationsLabels,
          vocabulaire.formationLabel.versStandard,
        ),
      }
    case 'ServicesEtAccompagnement':
      return {
        section: 'ServicesEtAccompagnement',
        services: vocabulaire.traduites(
          saisie.services,
          vocabulaire.service.versStandard,
        ),
        modalitesAccompagnement: vocabulaire.traduites(
          saisie.modalitesAccompagnement,
          vocabulaire.modaliteAccompagnement.versStandard,
        ),
      }
    case 'ModalitesAccesAuService':
      return {
        section: 'ModalitesAccesAuService',
        modalitesAcces: modalitesAcces(saisie),
        telephone: telephone(saisie.parTelephone, saisie.numeroTelephone),
        courriels: courriels(saisie.parMail, saisie.adresseMail),
        fraisACharge: vocabulaire.traduites(
          saisie.fraisACharge,
          vocabulaire.fraisACharge.versStandard,
        ),
      }
    case 'TypesDePublicsAccueillis':
      return {
        section: 'TypesDePublicsAccueillis',
        // « Tout public » n'est pas une colonne : c'est la liste vide.
        publicsSpecifiquementAdresses: saisie.toutPublic
          ? []
          : vocabulaire.traduites(
              saisie.publicsSpecifiquementAdresses,
              vocabulaire.publicSpecifiquementAdresse.versStandard,
            ),
        priseEnChargeSpecifique: vocabulaire.traduites(
          saisie.priseEnChargeSpecifique,
          vocabulaire.priseEnChargeSpecifique.versStandard,
        ),
      }
  }
}
