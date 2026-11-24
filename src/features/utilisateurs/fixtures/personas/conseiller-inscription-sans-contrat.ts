import { previewBranchAuthFallbacks } from '@/configuration/projet/previewBranchAuthFallbacks'
import { utilisateur } from '@/features/utilisateurs/fixtures/utilisateur'

const conseillerInscriptionSansContratEmail =
  'conseiller-inscription-sans-contrat@coop-numerique.anct.gouv.fr'

export const conseillerInscriptionSansContrat = utilisateur({
  id: '4ffc3f68-8ad2-4587-b731-5f0782c53002',
  firstName: 'Conseiller Num',
  lastName: 'Sans Contrat Inscription',
  isFixture: true,
  email: conseillerInscriptionSansContratEmail,
  role: 'User',
  siret: previewBranchAuthFallbacks.anctSiret,
})
