import type { CreerLieuActiviteData } from '@app/web/features/lieux-activite/formulaire/CreerLieuActiviteValidation'
import { Contact, Nom } from '@gouvfr-anct/lieux-de-mediation-numerique'
import { v4 } from 'uuid'
import { BanId } from '../../../domain/ban-id'
import type { Fiche } from '../../../domain/fiche'
import type { Lieu } from '../../../domain/lieu'
import { LieuId } from '../../../domain/lieu-id'
import {
  adresseSaisie,
  courrielsSaisis,
  horairesSaisis,
  itineranceSaisie,
  localisationSaisie,
  modalitesAccesSaisies,
  presentationSaisie,
  sitesWebSaisis,
  telephoneSaisi,
  urlSaisie,
} from '../../../domain/saisie'
import type { UserId } from '../../../domain/user-id'
import { VisibiliteCartographie } from '../../../domain/visibilite-cartographie'

/**
 * La saisie porte déjà le vocabulaire du schéma national : il n'y a plus rien à
 * traduire ici, seulement à rendre une liste là où le formulaire peut n'avoir
 * rien coché.
 */
const cochees = <Valeur>(
  valeurs: readonly Valeur[] | null | undefined,
): readonly Valeur[] => valeurs ?? []

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
  typologies: cochees(saisie.typologies),
  itinerance: itineranceSaisie(saisie.lieuItinerant),
})

const description = (
  saisie: CreerLieuActiviteData,
): Pick<Fiche, 'presentation' | 'formationsLabels'> => ({
  presentation: presentationSaisie(
    saisie.presentationResume,
    saisie.presentationDetail,
  ),
  formationsLabels: cochees(saisie.formationsLabels),
})

const informationsPratiques = (
  saisie: CreerLieuActiviteData,
): Pick<Fiche, 'horaires' | 'ficheAccesLibre' | 'priseRdv'> => ({
  horaires: horairesSaisis(saisie.openingHours, saisie.horairesComment),
  ficheAccesLibre: urlSaisie(saisie.ficheAccesLibre),
  priseRdv: urlSaisie(saisie.priseRdv),
})

const servicesEtAccompagnement = (
  saisie: CreerLieuActiviteData,
): Pick<Fiche, 'services' | 'modalitesAccompagnement'> => ({
  services: cochees(saisie.services),
  modalitesAccompagnement: cochees(saisie.modalitesAccompagnement),
})

const modalitesAccesAuService = (
  saisie: CreerLieuActiviteData,
): Pick<Fiche, 'modalitesAcces' | 'fraisACharge'> => ({
  modalitesAcces: modalitesAccesSaisies(
    modalitesCochees(saisie.modalitesAcces),
  ),
  fraisACharge: cochees(saisie.fraisACharge),
})

const typesDePublicsAccueillis = (
  saisie: CreerLieuActiviteData,
): Pick<
  Fiche,
  'publicsSpecifiquementAdresses' | 'priseEnChargeSpecifique'
> => ({
  publicsSpecifiquementAdresses: saisie.toutPublic
    ? []
    : cochees(saisie.publicsSpecifiquementAdresses),
  priseEnChargeSpecifique: cochees(saisie.priseEnChargeSpecifique),
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
