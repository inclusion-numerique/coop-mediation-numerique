import { CraCollectifData } from '@/features/activites/abilities/enregistrer-un-atelier-collectif/ui/validation/CraCollectifValidation'
import { participantsAnonymesDefault } from '@/features/activites/abilities/enregistrer-un-atelier-collectif/ui/validation/participantsAnonymes'
import type { DefaultValues } from '@/libs/form/use-app-form'

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
