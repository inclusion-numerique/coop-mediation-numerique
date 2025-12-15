import { previewBranchAuthFallbacks } from '@app/web/auth/previewBranchAuthFallbacks'
import { givenUser } from '../givenUser'
import { centreSocial, mediateque, structureEmployeuse } from '../structures'

export const conseillerInscriptionMediateurId =
  'b119ef9d-5732-4429-8138-5452fe248497'

export const conseillerInscriptionConseillerNumeriqueId =
  '630346008f4a3696aee73cfd'

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
  mediateur: {
    connectOrCreate: {
      where: {
        id: conseillerInscriptionMediateurId,
      },
      create: {
        id: conseillerInscriptionMediateurId,
        conseillerNumerique: {
          connectOrCreate: {
            where: {
              id: conseillerInscriptionConseillerNumeriqueId,
            },
            create: {
              id: conseillerInscriptionConseillerNumeriqueId,
            },
          },
        },
      },
    },
  },
})
