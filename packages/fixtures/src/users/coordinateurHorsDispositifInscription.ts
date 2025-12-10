import { givenUser } from '../givenUser'
import { previewBranchAuthFallbacks } from '@app/web/auth/previewBranchAuthFallbacks'

export const coordinateurHorsDispositifInscriptionEmail =
  'coordinateur-hors-dispositif-inscription@coop-numerique.anct.gouv.fr'

export const coordinateurHorsDispositifInscription = givenUser({
  id: '7d64a772-3fc3-4fcd-935a-7c29c8b16610',
  firstName: 'Coordinateur hors dispositif',
  lastName: 'Inscription',
  isFixture: true,
  email: coordinateurHorsDispositifInscriptionEmail,
  role: 'User',
  siret: previewBranchAuthFallbacks.anctSiret,
})
