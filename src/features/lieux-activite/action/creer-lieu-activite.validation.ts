import z from 'zod'
import {
  PUBLICATION_SANS_SERVICE,
  publicationSansService,
} from '@/features/lieux-activite/domain/registre/publication'
import {
  adresseReconnue,
  commentaireAdosseAUnCreneau,
} from '@/features/lieux-activite/domain/saisie/regles-de-saisie'
import { DescriptionShape } from './description.validation'
import { IdentiteLieuShape } from './informations-generales.validation'
import { InformationsPratiquesShape } from './informations-pratiques.validation'
import { ModalitesAccesAuServiceShape } from './modalites-acces-au-service.validation'
import { ServicesEtAccompagnementShape } from './services-et-accompagnement.validation'
import { TypesDePublicsAccueillisShape } from './types-de-publics-accueillis.validation'
import { VisiblePourCartographieNationaleShape } from './visible-pour-cartographie-nationale.validation'

const CreerLieuShape = {
  ...IdentiteLieuShape,
  ...VisiblePourCartographieNationaleShape,
  ...DescriptionShape,
  ...InformationsPratiquesShape,
  ...ModalitesAccesAuServiceShape,
  ...ServicesEtAccompagnementShape,
  ...TypesDePublicsAccueillisShape,
}

const auMoinsUnServiceSiVisible: [
  (data: {
    visiblePourCartographieNationale?: boolean | undefined
    services?: unknown[] | null | undefined
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

export const CreerLieuActiviteValidation = z
  .object(CreerLieuShape)
  .refine(...auMoinsUnServiceSiVisible)
  .refine(...commentaireAdosseAUnCreneau)
  .refine(...adresseReconnue)

export type CreerLieuActiviteData = z.infer<typeof CreerLieuActiviteValidation>
