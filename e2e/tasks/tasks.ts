import { createApiClient } from '@e2e/tasks/handlers/client-api.tasks'
import { createInvitation } from '@e2e/tasks/handlers/create-invitation'
import { preparerLesPersonas } from '@e2e/tasks/handlers/personas.tasks'
import {
  connectRdvAccountFor,
  getRdvAccountFor,
  reglageRdvsDansActivitesFor,
  seedRdvsFor,
} from '@e2e/tasks/handlers/rdv.tasks'
import {
  createCoordinateurFor,
  createSession,
  createUser,
  deleteSession,
  deleteUser,
} from '@e2e/tasks/handlers/user.tasks'

/**
 * Export of custom tasks that can be run with cy.execute() type safe custom command
 */
export const tasks = {
  createUser,
  deleteUser,
  createSession,
  deleteSession,
  preparerLesPersonas,
  createInvitation,
  createApiClient,
  createCoordinateurFor,
  connectRdvAccountFor,
  getRdvAccountFor,
  seedRdvsFor,
  reglageRdvsDansActivitesFor,
}

export type Tasks = typeof tasks

export type TaskName = keyof Tasks
