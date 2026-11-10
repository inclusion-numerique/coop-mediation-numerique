import {
  ModalitesAcces,
  Pivot,
  Services,
} from '@gouvfr-anct/lieux-de-mediation-numerique'
import type { Fiche } from '../../../domain/fiche'
import type { NomUsage } from '../../../domain/identite-sirene'
import type { Lieu } from '../../../domain/lieu'
import { servicesALaPublication } from '../../../domain/publication'
import { ModifieParUtilisateur } from '../../../domain/tracabilite'
import type { UserId } from '../../../domain/user-id'
import { estPublie } from '../../../domain/visibilite-cartographie'
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

const visibiliteCartographie = (
  fiche: Fiche,
  { visibilite }: Modification<'VisibiliteCartographie'>,
): Fiche =>
  estPublie(visibilite)
    ? {
        ...fiche,
        services: Services([...servicesALaPublication(fiche.services)]),
      }
    : fiche

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
  modalitesAcces: ModalitesAcces(
    modalitesApres(fiche.modalitesAcces, modalitesAcces),
  ),
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

const ficheParSection: {
  [Section in SectionDeLaFiche]: (
    fiche: Fiche,
    modification: Modification<Section>,
  ) => Fiche
} = {
  InformationsGenerales: informationsGenerales,
  VisibiliteCartographie: visibiliteCartographie,
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

const identiteSireneApres = (
  lieu: Lieu,
  pivot: Pivot | null,
  nomUsage: NomUsage | null,
): Lieu['identiteSirene'] => ({
  nomUsage,
  synchronisation:
    pivot === lieu.fiche.pivot ? lieu.identiteSirene.synchronisation : null,
})

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
