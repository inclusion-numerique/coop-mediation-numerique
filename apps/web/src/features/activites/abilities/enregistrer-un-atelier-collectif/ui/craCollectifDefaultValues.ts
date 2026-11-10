import { CraCollectifData } from '@app/web/features/activites/abilities/enregistrer-un-atelier-collectif/ui/validation/CraCollectifValidation'
import { participantsAnonymesDefault } from '@app/web/features/activites/abilities/enregistrer-un-atelier-collectif/ui/validation/participantsAnonymes'
import type { DefaultValues } from 'react-hook-form'

export const craCollectifDefaultValues = (
  stateFromUrl: DefaultValues<CraCollectifData>,
) => ({
  participantsAnonymes: {
    ...participantsAnonymesDefault,
    ...stateFromUrl.participantsAnonymes,
  },
  participants:
    stateFromUrl.participants?.filter((participant) => !!participant?.id) ?? [],
})
