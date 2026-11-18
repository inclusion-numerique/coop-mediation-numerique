import { previewBranchAuthFallbacks } from '@/auth/previewBranchAuthFallbacks'
import { givenUser } from '@/features/utilisateurs/fixtures/givenUser'

const conseillerSansLieuInscriptionEmail =
  'conseiller-sans-lieu-inscription@coop-numerique.anct.gouv.fr'

export const conseillerSansLieuInscription = givenUser({
  id: 'be15e33d-e07d-4d17-85fb-48dddbad9a5d',
  firstName: 'Conseiller Num',
  lastName: 'Sans Lieu Inscription',
  isFixture: true,
  email: conseillerSansLieuInscriptionEmail,
  role: 'User',
  siret: previewBranchAuthFallbacks.anctSiret,
})
