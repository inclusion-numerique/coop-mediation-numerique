import { previewBranchAuthFallbacks } from '@app/web/auth/previewBranchAuthFallbacks'
import { givenUser } from '../givenUser'

export const conseillerInscriptionSansContratEmail =
  'conseiller-inscription-sans-contrat@coop-numerique.anct.gouv.fr'

export const conseillerInscriptionSansContrat = givenUser({
  id: '4ffc3f68-8ad2-4587-b731-5f0782c53002',
  firstName: 'Conseiller Num',
  lastName: 'Sans Contrat Inscription',
  isFixture: true,
  email: conseillerInscriptionSansContratEmail,
  role: 'User',
  siret: previewBranchAuthFallbacks.anctSiret,
})
