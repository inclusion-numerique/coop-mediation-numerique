import { nomAffiche } from '@app/web/features/lieux-activite/domain/nom-affiche'
import { getCartographieNationaleSourceLabel } from '@app/web/libraries/cartographie-nationale'
import { pluriel } from '@app/web/libraries/pluriel'
import { getDepartementCodeFromCodeInsee } from '@app/web/utils/getDepartementFromCodeInsee'
import type { Fiche } from '../../../domain/fiche'
import type { Lieu } from '../../../domain/lieu'
import { estPublie } from '../../../domain/visibilite-cartographie'
import { estPartage, type FicheDuLieu, type PartageDuLieu } from '../domain'
import {
  type DescriptionAffichee,
  description,
} from './fiche-affichee/description'
import {
  type InformationsGeneralesAffichees,
  informationsGenerales,
} from './fiche-affichee/informations-generales'
import {
  type InformationsPratiquesAffichees,
  informationsPratiques,
} from './fiche-affichee/informations-pratiques'
import {
  type ModalitesAccesAuServiceAffichees,
  modalitesAccesAuService,
} from './fiche-affichee/modalites-acces-au-service'
import {
  type RepriseExterne,
  repriseExterne,
} from './fiche-affichee/reprise-externe'
import {
  type ServicesEtAccompagnementAffiches,
  servicesEtAccompagnement,
} from './fiche-affichee/services-et-accompagnement'
import {
  type TypesDePublicsAccueillisAffiches,
  typesDePublicsAccueillis,
} from './fiche-affichee/types-de-publics-accueillis'

export type PartageAffiche = {
  readonly message: string
}

export type FicheAffichee = {
  readonly id: string
  readonly nom: string
  readonly misAJourLe: Date
  readonly misAJourPar: string | null
  readonly repriseExterne: RepriseExterne | null
  readonly publieSurLaCartographie: boolean
  readonly connuDeLaCartographie: boolean
  readonly departementCode: string
  readonly informationsGenerales: InformationsGeneralesAffichees
  readonly informationsPratiques: InformationsPratiquesAffichees
  readonly description: DescriptionAffichee
  readonly servicesEtAccompagnement: ServicesEtAccompagnementAffiches
  readonly modalitesAccesAuService: ModalitesAccesAuServiceAffichees
  readonly typesDePublicsAccueillis: TypesDePublicsAccueillisAffiches
  readonly partage: PartageAffiche | null
}

const DEPARTEMENT_PAR_DEFAUT = '75'

const nombre = new Intl.NumberFormat('fr-FR')

const partageAffiche = (partage: PartageDuLieu): PartageAffiche | null =>
  estPartage(partage)
    ? {
        message: `${nombre.format(partage.autresMediateurs)} ${pluriel(partage.autresMediateurs, 'autre médiateur exerce', 'autres médiateurs exercent')} dans ce lieu et ${nombre.format(partage.activites)} ${pluriel(partage.activites, 'activité y est rattachée', 'activités y sont rattachées')}.`,
      }
    : null

const departementCode = (fiche: Fiche): string =>
  fiche.adresse?.code_insee == null
    ? DEPARTEMENT_PAR_DEFAUT
    : getDepartementCodeFromCodeInsee(fiche.adresse.code_insee)

const misAJourPar = (lieu: Lieu, auteurCoop: string | null): string | null => {
  const { derniereModification } = lieu.tracabilite

  return derniereModification._tag === 'ParSource'
    ? getCartographieNationaleSourceLabel(derniereModification.source)
    : auteurCoop
}

export const ficheAffichee = (fiche: FicheDuLieu): FicheAffichee => {
  const { lieu, auteurDerniereModification } = fiche

  return {
    id: lieu.id,
    nom: nomAffiche(lieu.fiche.nom, lieu.identiteSirene.nomUsage),
    misAJourLe: lieu.tracabilite.derniereModification.date,
    misAJourPar: misAJourPar(lieu, auteurDerniereModification),
    repriseExterne: repriseExterne(fiche),
    publieSurLaCartographie: estPublie(lieu.visibilite),
    connuDeLaCartographie: lieu.idsCartographieNationale != null,
    departementCode: departementCode(lieu.fiche),
    informationsGenerales: informationsGenerales(lieu),
    informationsPratiques: informationsPratiques(lieu.fiche),
    description: description(lieu.fiche),
    servicesEtAccompagnement: servicesEtAccompagnement(lieu.fiche),
    modalitesAccesAuService: modalitesAccesAuService(lieu.fiche),
    typesDePublicsAccueillis: typesDePublicsAccueillis(lieu.fiche),
    partage: partageAffiche(fiche.partage),
  }
}
