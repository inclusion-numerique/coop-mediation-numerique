import { type Result, success } from '@/libraries/result'
import type { PerimetreDesStatistiques } from '../../../domain'
import type { VerifierLaPresenceDeCrasV1Ports } from './ports'
import { PresenceDeCrasV1 } from './presence-de-cras-v1'

export const verifierLaPresenceDeCrasV1 =
  ({ mediateurAvecCrasV1 }: VerifierLaPresenceDeCrasV1Ports) =>
  async ({
    perimetre,
  }: {
    readonly perimetre: PerimetreDesStatistiques
  }): Promise<Result<PresenceDeCrasV1, never>> => {
    if (perimetre.type !== 'Mediateur') {
      return success(PresenceDeCrasV1('Presents'))
    }
    return success(
      PresenceDeCrasV1(
        (await mediateurAvecCrasV1(perimetre.mediateur))
          ? 'Presents'
          : 'Absents',
      ),
    )
  }
