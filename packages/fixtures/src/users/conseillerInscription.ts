import { previewBranchAuthFallbacks } from '@app/web/auth/previewBranchAuthFallbacks'
import { givenUser } from '../givenUser'

export const conseillerInscriptionEmail =
  'conseiller-inscription@coop-numerique.anct.gouv.fr'

export const conseillerInscription = givenUser({
  id: '0658cfe9-93aa-4de8-96a1-613452ac82ea',
  firstName: 'Conseiller Num',
  lastName: 'Inscription',
  isFixture: true,
  email: conseillerInscriptionEmail,
  role: 'User',
  siret: previewBranchAuthFallbacks.anctSiret,
})
