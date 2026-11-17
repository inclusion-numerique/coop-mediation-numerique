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

export const CreerLieuShape = {
  ...IdentiteLieuShape,
  ...VisiblePourCartographieNationaleShape,
  ...DescriptionShape,
  ...InformationsPratiquesShape,
  ...ModalitesAccesAuServiceShape,
  ...ServicesEtAccompagnementShape,
  ...TypesDePublicsAccueillisShape,
}

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
