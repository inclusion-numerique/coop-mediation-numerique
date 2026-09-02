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
      const immatriculation = pivotSaisi(saisie.siret, saisie.rna)

      return {
        section: 'InformationsGenerales',
        nom: Nom(saisie.nom),
        adresse: adresseSaisie(saisie.adresseBan, saisie.complementAdresse),
        localisation: localisationSaisie(saisie.adresseBan),
        banId: BanId.safe(saisie.adresseBan.id),
        itinerance: itineranceSaisie(saisie.lieuItinerant),
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
        sitesWeb: sitesWebSaisis(saisie.siteWeb),
        ficheAccesLibre: urlSaisie(saisie.ficheAccesLibre),
        priseRdv: urlSaisie(saisie.priseRdv),
        horaires: horairesOsm(saisie.openingHours, saisie.horairesComment),
      }
    case 'Description':
      return {
        section: 'Description',
        presentation: presentationSaisie(
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
        modalitesAcces: modalitesAccesSaisies(saisie),
        telephone: telephoneSaisi(saisie.parTelephone, saisie.numeroTelephone),
        courriels: courrielsSaisis(saisie.parMail, saisie.adresseMail),
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
