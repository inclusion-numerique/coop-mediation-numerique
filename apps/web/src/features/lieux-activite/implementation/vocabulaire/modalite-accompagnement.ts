import { ModaliteAccompagnement } from '@gouvfr-anct/lieux-de-mediation-numerique'
import { pont } from './pont'

const table = {
  EnAutonomie: ModaliteAccompagnement.EnAutonomie,
  AccompagnementIndividuel: ModaliteAccompagnement.AccompagnementIndividuel,
  DansUnAtelierCollectif: ModaliteAccompagnement.DansUnAtelier,
  ADistance: ModaliteAccompagnement.ADistance,
} satisfies Record<string, ModaliteAccompagnement>

export type ModaliteAccompagnementCoop = keyof typeof table

export const modaliteAccompagnement = pont(ModaliteAccompagnement, table)
