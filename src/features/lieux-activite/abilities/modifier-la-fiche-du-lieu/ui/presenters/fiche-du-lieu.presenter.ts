import { libelleDeLaSource } from '@/features/lieux-activite/domain/cartographie-nationale/sources'
import { nomAffiche } from '@/features/lieux-activite/domain/nom-affiche'
import { CodeInsee, codeDepartementDuCodeInsee } from '@/libraries/insee'
import { pluriel } from '@/libraries/pluriel'
import { estPublie } from '../../../../domain/cartographie-nationale/visibilite-cartographie'
import type { Fiche } from '../../../../domain/fiche'
import type { Lieu } from '../../../../domain/lieu'
import { estPartage, type FicheDuLieu, type PartageDuLieu } from '../../domain'
import { type DescriptionAffichee, description } from './description.presenter'
import {
  type InformationsGeneralesAffichees,
  informationsGenerales,
} from './informations-generales.presenter'
import {
  type InformationsPratiquesAffichees,
  informationsPratiques,
} from './informations-pratiques.presenter'
import {
  type ModalitesAccesAuServiceAffichees,
  modalitesAccesAuService,
} from './modalites-acces-au-service.presenter'
import {
  type RepriseExterne,
  repriseExterne,
} from './reprise-externe.presenter'
import {
  type ServicesEtAccompagnementAffiches,
  servicesEtAccompagnement,
} from './services-et-accompagnement.presenter'
import {
  type TypesDePublicsAccueillisAffiches,
  typesDePublicsAccueillis,
} from './types-de-publics-accueillis.presenter'

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

const departementCode = (fiche: Fiche): string => {
  const codeInsee = CodeInsee.safe(fiche.adresse?.code_insee ?? '')
  return codeInsee === null
    ? DEPARTEMENT_PAR_DEFAUT
    : codeDepartementDuCodeInsee(codeInsee)
}

const misAJourPar = (lieu: Lieu, auteurCoop: string | null): string | null => {
  const { derniereModification } = lieu.tracabilite

  return derniereModification._tag === 'ParSource'
    ? libelleDeLaSource(derniereModification.source)
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
