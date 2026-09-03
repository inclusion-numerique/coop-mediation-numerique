import { appendComment } from '@app/web/components/structure/fields/openingHoursHelpers'
import type { CreerLieuActiviteData } from '@app/web/features/structures/CreerLieuActiviteValidation'
import { Contact, Nom } from '@gouvfr-anct/lieux-de-mediation-numerique'
import { v4 } from 'uuid'
import { BanId } from '../../../domain/ban-id'
import type { Lieu } from '../../../domain/lieu'
import { LieuId } from '../../../domain/lieu-id'
import {
  adresseSaisie,
  courrielsSaisis,
  itineranceSaisie,
  localisationSaisie,
  modalitesAccesSaisies,
  nonVide,
  presentationSaisie,
  sitesWebSaisis,
  telephoneSaisi,
  urlSaisie,
} from '../../../domain/saisie'
import type { UserId } from '../../../domain/user-id'
import { VisibiliteCartographie } from '../../../domain/visibilite-cartographie'
import * as vocabulaire from '../../../vocabulaire'

/**
 * Un lieu qu'on crée n'a pas d'immatriculation : on ne le saisit que lorsque
 * la recherche par nom, adresse ou SIRET n'a rien rendu. Il n'a pas non plus
 * de correspondance dans la cartographie nationale — il vient d'être inventé.
 */
export const nouveauLieu = (
  saisie: CreerLieuActiviteData,
  par: UserId,
  maintenant: Date,
): Lieu => {
  const modalites = saisie.modalitesAcces ?? {
    surPlace: false,
    parTelephone: false,
    parMail: false,
    numeroTelephone: null,
    adresseMail: null,
  }
  const surPlace = modalites.surPlace === true
  const parTelephone = modalites.parTelephone === true
  const parMail = modalites.parMail === true

  const telephone = telephoneSaisi(parTelephone, modalites.numeroTelephone)
  const courriels = courrielsSaisis(parMail, modalites.adresseMail)
  const sitesWeb = sitesWebSaisis(saisie.siteWeb)

  return {
    id: LieuId(v4()),
    fiche: {
      nom: Nom(saisie.nom),
      pivot: null,
      adresse: adresseSaisie(saisie.adresseBan, saisie.complementAdresse),
      localisation: localisationSaisie(saisie.adresseBan),
      typologies: vocabulaire.traduites(
        saisie.typologies,
        vocabulaire.typologie.versStandard,
      ),
      contact: Contact({
        ...(telephone == null ? {} : { telephone }),
        ...(courriels.length === 0 ? {} : { courriels: [...courriels] }),
        ...(sitesWeb.length === 0 ? {} : { site_web: [...sitesWeb] }),
      }),
      horaires: nonVide(
        appendComment(saisie.horaires ?? '', nonVide(saisie.horairesComment)),
      ),
      presentation: presentationSaisie(
        saisie.presentationResume,
        saisie.presentationDetail,
      ),
      services: vocabulaire.traduites(
        saisie.services ?? [],
        vocabulaire.service.versStandard,
      ),
      // « Tout public » n'est pas une colonne : c'est l'absence de public visé.
      publicsSpecifiquementAdresses: saisie.toutPublic
        ? []
        : vocabulaire.traduites(
            saisie.publicsSpecifiquementAdresses ?? [],
            vocabulaire.publicSpecifiquementAdresse.versStandard,
          ),
      priseEnChargeSpecifique: vocabulaire.traduites(
        saisie.priseEnChargeSpecifique ?? [],
        vocabulaire.priseEnChargeSpecifique.versStandard,
      ),
      modalitesAcces: modalitesAccesSaisies({
        surPlace,
        parTelephone,
        parMail,
      }),
      fraisACharge: vocabulaire.traduites(
        saisie.fraisACharge ?? [],
        vocabulaire.fraisACharge.versStandard,
      ),
      itinerance: itineranceSaisie(saisie.lieuItinerant),
      dispositifProgrammesNationaux: [],
      formationsLabels: vocabulaire.traduites(
        saisie.formationsLabels ?? [],
        vocabulaire.formationLabel.versStandard,
      ),
      autresFormationsLabels: [],
      modalitesAccompagnement: vocabulaire.traduites(
        saisie.modalitesAccompagnement ?? [],
        vocabulaire.modaliteAccompagnement.versStandard,
      ),
      ficheAccesLibre: urlSaisie(saisie.ficheAccesLibre),
      priseRdv: urlSaisie(saisie.priseRdv),
    },
    visibilite: VisibiliteCartographie(
      saisie.visiblePourCartographieNationale ? 'Publie' : 'NonPublie',
    ),
    idsCartographieNationale: null,
    banId: BanId.safe(saisie.adresseBan.id),
    identiteSirene: { nomUsage: null, synchronisation: null },
    tracabilite: {
      creation: { date: maintenant, par },
      derniereModification: { _tag: 'ParUtilisateur', date: maintenant, par },
      suppression: { _tag: 'Actif' },
    },
  }
}
