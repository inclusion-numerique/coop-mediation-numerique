import { givenUser } from '../givenUser'
import { structureEmployeuse } from '../structures'

const day = 24 * 60 * 60 * 1000
const date = new Date(Date.now() - 90 * day)

export const coordinateurInscritJ90CoordinateurId =
  'fb09c71e-1b69-434d-9def-60695236d1fe'

export const coordinateurInscritJ90 = givenUser({
  id: 'b6c95181-850b-43eb-adc6-251d45642a82',
  firstName: 'Coordinateur',
  lastName: 'Inscrit J+90',
  lastLogin: date,
  isFixture: true,
  role: 'User',
  coordinateur: {
    connectOrCreate: {
      where: {
        id: coordinateurInscritJ90CoordinateurId,
      },
      create: {
        id: coordinateurInscritJ90CoordinateurId,
      },
    },
  },
  emplois: {
    connectOrCreate: {
      where: {
        id: '670cc148-6e5f-4c93-88d0-29349d61ebc4',
      },
      create: {
        id: '670cc148-6e5f-4c93-88d0-29349d61ebc4',
        structureId: structureEmployeuse.id,
        debut: date,
      },
    },
  },
  profilInscription: 'Coordinateur',
  acceptationCgu: date,
  inscriptionValidee: date,
  structureEmployeuseRenseignee: date,
})
