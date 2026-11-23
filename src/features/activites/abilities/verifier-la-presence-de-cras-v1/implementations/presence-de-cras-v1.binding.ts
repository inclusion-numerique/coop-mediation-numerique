import type { PerimetreDesStatistiques } from '@/features/activites/domain'
import { verifierLaPresenceDeCrasV1 } from './prisma/presence-de-cras-v1.query'

export const presenceDeCrasV1 = (perimetre: PerimetreDesStatistiques) =>
  verifierLaPresenceDeCrasV1(perimetre).then((crasV1) => ({
    hasCrasV1: crasV1 === 'Presents',
  }))
