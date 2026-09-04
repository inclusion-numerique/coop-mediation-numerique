import { ModaliteAccompagnement } from '@gouvfr-anct/lieux-de-mediation-numerique'
import type { ModaliteAccompagnement as ModaliteAccompagnementCoop } from '@prisma/client'
import { pont } from './pont'

const table: Record<ModaliteAccompagnementCoop, ModaliteAccompagnement> = {
  EnAutonomie: ModaliteAccompagnement.EnAutonomie,
  AccompagnementIndividuel: ModaliteAccompagnement.AccompagnementIndividuel,
  DansUnAtelierCollectif: ModaliteAccompagnement.DansUnAtelier,
  ADistance: ModaliteAccompagnement.ADistance,
}

export const modaliteAccompagnement = pont(table)
