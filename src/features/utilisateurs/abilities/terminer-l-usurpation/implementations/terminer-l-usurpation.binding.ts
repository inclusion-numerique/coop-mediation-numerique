import { terminerLUsurpation as terminer } from '../domain/terminer-l-usurpation'
import {
  rendreLaSession,
  sessionCourante,
} from './prisma/session-courante.mutation'

export const terminerLUsurpation = terminer({
  lireLaSession: sessionCourante,
  rendreLaSession,
})
