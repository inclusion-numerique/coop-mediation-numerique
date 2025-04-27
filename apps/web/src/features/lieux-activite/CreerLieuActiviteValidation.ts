import { DescriptionShape } from '@app/web/features/structures/DescriptionValidation'
import { InformationsGeneralesShape } from '@app/web/features/structures/InformationsGeneralesValidation'
import { InformationsPratiquesShape } from '@app/web/features/structures/InformationsPratiquesValidation'
import { ModalitesAccesAuServiceShape } from '@app/web/features/structures/ModalitesAccesAuServiceValidation'
import { ServicesEtAccompagnementShape } from '@app/web/features/structures/ServicesEtAccompagnementValidation'
import { TypesDePublicsAccueillisShape } from '@app/web/features/structures/TypesDePublicsAccueillisValidation'
import { VisiblePourCartographieNationaleShape } from '@app/web/features/structures/VisiblePourCartographieNationaleValidation'
import z from 'zod'

export const CreerLieuActiviteValidation = z
  .object({
    ...InformationsGeneralesShape,
    ...VisiblePourCartographieNationaleShape,
    ...DescriptionShape,
    ...InformationsPratiquesShape,
    ...ModalitesAccesAuServiceShape,
    ...ServicesEtAccompagnementShape,
    ...TypesDePublicsAccueillisShape,
  })
  .refine(
    (data) =>
      !data.visiblePourCartographieNationale ||
      (data.services?.length ?? 0) > 0,
    {
      message:
        'Au moins un service doit être renseigné pour que le lieu d’activité soit visible sur la cartographie.',
      path: ['services'],
    },
  )

export type CreerLieuActiviteData = z.infer<typeof CreerLieuActiviteValidation>
