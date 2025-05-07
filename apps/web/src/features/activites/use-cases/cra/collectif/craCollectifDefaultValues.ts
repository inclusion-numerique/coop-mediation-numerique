import type { DefaultValues } from 'react-hook-form'
import { CraCollectifData } from './validation/CraCollectifValidation'
import { participantsAnonymesDefault } from './validation/participantsAnonymes'

export const craCollectifDefaultValues = (
  mediateurId: string,
  stateFromUrl: DefaultValues<CraCollectifData>,
) => ({
  participantsAnonymes: {
    ...participantsAnonymesDefault,
    ...stateFromUrl.participantsAnonymes,
  },
  participants:
    stateFromUrl.participants?.filter(
      (participant) =>
        !!participant?.id && participant.mediateurId === mediateurId,
    ) ?? [],
})
