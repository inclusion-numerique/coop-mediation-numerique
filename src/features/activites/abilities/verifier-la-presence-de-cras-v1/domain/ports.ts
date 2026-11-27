import type { MediateurId } from '../../../domain'

export type MediateurAvecCrasV1 = (mediateur: MediateurId) => Promise<boolean>

export type VerifierLaPresenceDeCrasV1Ports = {
  readonly mediateurAvecCrasV1: MediateurAvecCrasV1
}
