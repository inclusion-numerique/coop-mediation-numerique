import type { Pivot } from '@gouvfr-anct/lieux-de-mediation-numerique'
import type { Fiche } from '../../../domain/fiche'
import type { NomUsage } from '../../../domain/identite-sirene'
import type { Lieu } from '../../../domain/lieu'
import { ModifieParUtilisateur } from '../../../domain/tracabilite'
import type { UserId } from '../../../domain/user-id'
import {
  contactAvecJoignabilite,
  contactAvecSitesWeb,
  modalitesApres,
} from './contact-de-la-fiche'
import type {
  Modification,
  ModificationLieu,
  SectionDeLaFiche,
} from './modification-lieu'

/**
 * Ce qu'une modification fait au lieu.
 *
 * Le contrat — quelles sections existent, et ce que chacune porte — se lit dans
 * `modification-lieu`. Ici se tient son application : une fonction par section,
 * la table qui les rassemble, et l'enveloppe coop que deux d'entre elles
 * touchent.
 */

/** La visibilité relève de l'enveloppe coop : la fiche n'en sait rien. */
const ficheInchangee = (fiche: Fiche): Fiche => fiche

const informationsGenerales = (
  fiche: Fiche,
  {
    nom,
    adresse,
    localisation,
    itinerance,
    typologies,
    pivot,
  }: Modification<'InformationsGenerales'>,
): Fiche => ({
  ...fiche,
  nom,
  adresse,
  localisation,
  itinerance,
  typologies,
  pivot,
})

const informationsPratiques = (
  fiche: Fiche,
  {
    sitesWeb,
    ficheAccesLibre,
    priseRdv,
    horaires,
  }: Modification<'InformationsPratiques'>,
): Fiche => ({
  ...fiche,
  contact: contactAvecSitesWeb(fiche.contact, sitesWeb),
  ficheAccesLibre,
  priseRdv,
  horaires,
})

const description = (
  fiche: Fiche,
  { presentation, formationsLabels }: Modification<'Description'>,
): Fiche => ({ ...fiche, presentation, formationsLabels })

const servicesEtAccompagnement = (
  fiche: Fiche,
  {
    services,
    modalitesAccompagnement,
  }: Modification<'ServicesEtAccompagnement'>,
): Fiche => ({ ...fiche, services, modalitesAccompagnement })

const modalitesAccesAuService = (
  fiche: Fiche,
  {
    telephone,
    courriels,
    modalitesAcces,
    fraisACharge,
  }: Modification<'ModalitesAccesAuService'>,
): Fiche => ({
  ...fiche,
  contact: contactAvecJoignabilite(fiche.contact, telephone, courriels),
  modalitesAcces: modalitesApres(fiche.modalitesAcces, modalitesAcces),
  fraisACharge,
})

const typesDePublicsAccueillis = (
  fiche: Fiche,
  {
    publicsSpecifiquementAdresses,
    priseEnChargeSpecifique,
  }: Modification<'TypesDePublicsAccueillis'>,
): Fiche => ({
  ...fiche,
  publicsSpecifiquementAdresses,
  priseEnChargeSpecifique,
})

/**
 * Ce que chaque section change à la fiche, une ligne par section.
 *
 * La table remplace le `switch` qui la disait avant : chaque cas n'a plus à se
 * nommer deux fois, et l'exhaustivité ne tient plus à une directive de lint
 * mais au type — une section ajoutée à l'union sans sa ligne ici ne compile
 * pas.
 */
const ficheParSection: {
  [Section in SectionDeLaFiche]: (
    fiche: Fiche,
    modification: Modification<Section>,
  ) => Fiche
} = {
  InformationsGenerales: informationsGenerales,
  VisibiliteCartographie: ficheInchangee,
  InformationsPratiques: informationsPratiques,
  Description: description,
  ServicesEtAccompagnement: servicesEtAccompagnement,
  ModalitesAccesAuService: modalitesAccesAuService,
  TypesDePublicsAccueillis: typesDePublicsAccueillis,
}

const ficheApres = <Section extends SectionDeLaFiche>(
  fiche: Fiche,
  modification: Modification<Section>,
): Fiche => ficheParSection[modification.section](fiche, modification)

/**
 * Ce que la coop sait de l'établissement au répertoire SIRENE.
 *
 * `synchronisation` date la confrontation du pivot à SIRENE : elle atteste CE
 * numéro-là. Un pivot qui change emporte donc sa preuve, sans quoi le nouveau
 * SIRET hériterait de la vérification du précédent — et le job qui les contrôle,
 * qui saute les lieux vérifiés depuis peu, ne le regarderait jamais.
 */
const identiteSireneApres = (
  lieu: Lieu,
  pivot: Pivot | null,
  nomUsage: NomUsage | null,
): Lieu['identiteSirene'] => ({
  nomUsage,
  synchronisation:
    pivot === lieu.fiche.pivot ? lieu.identiteSirene.synchronisation : null,
})

/** L'enveloppe coop ne bouge que pour deux des sept sections. */
const enveloppeApres = (lieu: Lieu, modification: ModificationLieu) => ({
  visibilite:
    modification.section === 'VisibiliteCartographie'
      ? modification.visibilite
      : lieu.visibilite,
  banId:
    modification.section === 'InformationsGenerales'
      ? modification.banId
      : lieu.banId,
  identiteSirene:
    modification.section === 'InformationsGenerales'
      ? identiteSireneApres(lieu, modification.pivot, modification.nomUsage)
      : lieu.identiteSirene,
})

export const appliquerModification = (
  lieu: Lieu,
  modification: ModificationLieu,
  par: UserId,
  maintenant: Date,
): Lieu => ({
  ...lieu,
  fiche: ficheApres(lieu.fiche, modification),
  ...enveloppeApres(lieu, modification),
  tracabilite: {
    ...lieu.tracabilite,
    derniereModification: ModifieParUtilisateur(maintenant, par),
  },
})
