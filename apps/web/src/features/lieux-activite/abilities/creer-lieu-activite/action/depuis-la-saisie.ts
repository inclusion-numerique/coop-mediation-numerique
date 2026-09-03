import { appendComment } from '@app/web/components/structure/fields/openingHoursHelpers'
import type { CreerLieuActiviteData } from '@app/web/features/structures/CreerLieuActiviteValidation'
import { Contact, Nom } from '@gouvfr-anct/lieux-de-mediation-numerique'
import { v4 } from 'uuid'
import { BanId } from '../../../domain/ban-id'
import type { Fiche } from '../../../domain/fiche'
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

const traduits = <Depuis extends string, Vers extends string>(
  valeurs: readonly Depuis[] | null | undefined,
  table: { versStandard: (valeur: Depuis) => Vers | null },
): readonly Vers[] => vocabulaire.traduites(valeurs ?? [], table.versStandard)

const modalitesCochees = (
  modalites: CreerLieuActiviteData['modalitesAcces'],
) => ({
  surPlace: modalites?.surPlace === true,
  parTelephone: modalites?.parTelephone === true,
  parMail: modalites?.parMail === true,
  numeroTelephone: modalites?.numeroTelephone,
  adresseMail: modalites?.adresseMail,
})

const identiteDuLieu = (
  saisie: CreerLieuActiviteData,
): Pick<
  Fiche,
  'nom' | 'pivot' | 'adresse' | 'localisation' | 'typologies' | 'itinerance'
> => ({
  nom: Nom(saisie.nom),
  pivot: null,
  adresse: adresseSaisie(saisie.adresseBan, saisie.complementAdresse),
  localisation: localisationSaisie(saisie.adresseBan),
  typologies: traduits(saisie.typologies, vocabulaire.typologie),
  itinerance: itineranceSaisie(saisie.lieuItinerant),
})

const description = (
  saisie: CreerLieuActiviteData,
): Pick<Fiche, 'presentation' | 'formationsLabels'> => ({
  presentation: presentationSaisie(
    saisie.presentationResume,
    saisie.presentationDetail,
  ),
  formationsLabels: traduits(
    saisie.formationsLabels,
    vocabulaire.formationLabel,
  ),
})

const informationsPratiques = (
  saisie: CreerLieuActiviteData,
): Pick<Fiche, 'horaires' | 'ficheAccesLibre' | 'priseRdv'> => ({
  horaires: nonVide(
    appendComment(saisie.horaires ?? '', nonVide(saisie.horairesComment)),
  ),
  ficheAccesLibre: urlSaisie(saisie.ficheAccesLibre),
  priseRdv: urlSaisie(saisie.priseRdv),
})

const servicesEtAccompagnement = (
  saisie: CreerLieuActiviteData,
): Pick<Fiche, 'services' | 'modalitesAccompagnement'> => ({
  services: traduits(saisie.services, vocabulaire.service),
  modalitesAccompagnement: traduits(
    saisie.modalitesAccompagnement,
    vocabulaire.modaliteAccompagnement,
  ),
})

const modalitesAccesAuService = (
  saisie: CreerLieuActiviteData,
): Pick<Fiche, 'modalitesAcces' | 'fraisACharge'> => ({
  modalitesAcces: modalitesAccesSaisies(
    modalitesCochees(saisie.modalitesAcces),
  ),
  fraisACharge: traduits(saisie.fraisACharge, vocabulaire.fraisACharge),
})

const typesDePublicsAccueillis = (
  saisie: CreerLieuActiviteData,
): Pick<
  Fiche,
  'publicsSpecifiquementAdresses' | 'priseEnChargeSpecifique'
> => ({
  publicsSpecifiquementAdresses: saisie.toutPublic
    ? []
    : traduits(
        saisie.publicsSpecifiquementAdresses,
        vocabulaire.publicSpecifiquementAdresse,
      ),
  priseEnChargeSpecifique: traduits(
    saisie.priseEnChargeSpecifique,
    vocabulaire.priseEnChargeSpecifique,
  ),
})

const contactSaisi = (saisie: CreerLieuActiviteData): Contact => {
  const modalites = modalitesCochees(saisie.modalitesAcces)
  const telephone = telephoneSaisi(
    modalites.parTelephone,
    modalites.numeroTelephone,
  )
  const courriels = courrielsSaisis(modalites.parMail, modalites.adresseMail)
  const sitesWeb = sitesWebSaisis(saisie.siteWeb)

  return Contact({
    ...(telephone == null ? {} : { telephone }),
    ...(courriels.length === 0 ? {} : { courriels: [...courriels] }),
    ...(sitesWeb.length === 0 ? {} : { site_web: [...sitesWeb] }),
  })
}

const ficheSaisie = (saisie: CreerLieuActiviteData): Fiche => ({
  ...identiteDuLieu(saisie),
  ...description(saisie),
  ...informationsPratiques(saisie),
  ...servicesEtAccompagnement(saisie),
  ...modalitesAccesAuService(saisie),
  ...typesDePublicsAccueillis(saisie),
  contact: contactSaisi(saisie),
  dispositifProgrammesNationaux: [],
  autresFormationsLabels: [],
})

export const nouveauLieu = (
  saisie: CreerLieuActiviteData,
  par: UserId,
  maintenant: Date,
): Lieu => ({
  id: LieuId(v4()),
  fiche: ficheSaisie(saisie),
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
})
