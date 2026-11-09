import {
  PUBLICATION_SANS_SERVICE,
  publicationSansService,
} from '@app/web/features/lieux-activite/domain/publication'
import { DescriptionShape } from './description.validation'
import { IdentiteLieuShape } from './informations-generales.validation'
import { InformationsPratiquesShape } from './informations-pratiques.validation'
import { ModalitesAccesAuServiceShape } from './modalites-acces-au-service.validation'
import { ServicesEtAccompagnementShape } from './services-et-accompagnement.validation'
import { TypesDePublicsAccueillisShape } from './types-de-publics-accueillis.validation'
import { VisiblePourCartographieNationaleShape } from './visible-pour-cartographie-nationale.validation'

/**
 * Ce qui se saisit à la création d'un lieu d'activité, quel que soit le parcours
 * qui y mène (inscription ou gestion des lieux). Aucune immatriculation : on ne
 * crée un lieu que lorsque la recherche par nom, adresse ou SIRET n'a rien rendu.
 */
export const CreerLieuShape = {
  ...IdentiteLieuShape,
  ...VisiblePourCartographieNationaleShape,
  ...DescriptionShape,
  ...InformationsPratiquesShape,
  ...ModalitesAccesAuServiceShape,
  ...ServicesEtAccompagnementShape,
  ...TypesDePublicsAccueillisShape,
}

/** Un lieu visible sur la cartographie doit annoncer au moins un service. */
export const auMoinsUnServiceSiVisible: [
  (data: {
    visiblePourCartographieNationale?: boolean
    services?: unknown[] | null
  }) => boolean,
  { message: string; path: (string | number)[] },
] = [
  (data) =>
    !publicationSansService(
      data.visiblePourCartographieNationale === true,
      data.services,
    ),
  { message: PUBLICATION_SANS_SERVICE, path: ['services'] },
]
