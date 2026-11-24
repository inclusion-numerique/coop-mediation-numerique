import { previewBranchAuthFallbacks } from '@/configuration/projet/previewBranchAuthFallbacks'
import { utilisateur } from '@/features/utilisateurs/fixtures/utilisateur'

const coordinateurHorsDispositifInscriptionEmail =
  'coordinateur-hors-dispositif-inscription@coop-numerique.anct.gouv.fr'

export const coordinateurHorsDispositifInscription = utilisateur({
  id: '7d64a772-3fc3-4fcd-935a-7c29c8b16610',
  firstName: 'Coordinateur hors dispositif',
  lastName: 'Inscription',
  isFixture: true,
  email: coordinateurHorsDispositifInscriptionEmail,
  role: 'User',
  siret: previewBranchAuthFallbacks.anctSiret,
})
