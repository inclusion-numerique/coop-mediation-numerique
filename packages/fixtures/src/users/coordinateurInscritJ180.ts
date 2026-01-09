import { givenUser } from '../givenUser'
import { structureEmployeuse } from '../structures'

const day = 24 * 60 * 60 * 1000
const date = new Date(Date.now() - 180 * day)

export const coordinateurInscritJ180CoordinateurId =
  '0d140478-d602-4662-ac80-66dcfb0b00c5'

export const coordinateurInscritJ180 = givenUser({
  id: '22e45992-bd78-40ed-aac0-53c6589d021d',
  firstName: 'Coordinateur',
  lastName: 'Inscrit J+180',
  lastLogin: date,
  isFixture: true,
  role: 'User',
  coordinateur: {
    connectOrCreate: {
      where: {
        id: coordinateurInscritJ180CoordinateurId,
      },
      create: {
        id: coordinateurInscritJ180CoordinateurId,
        derniereCreationActivite: date,
      },
    },
  },
  emplois: {
    connectOrCreate: {
      where: {
        id: '666585d8-1d16-424b-9c2f-df9444c6aa8f',
      },
      create: {
        id: '666585d8-1d16-424b-9c2f-df9444c6aa8f',
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
