import { givenUser } from '@app/fixtures/givenUser'
import { mediateque, structureEmployeuse } from '@app/fixtures/structures'
import type { Prisma } from '@prisma/client'
import { administrateur } from './administrateur'
import { conseillerInscription } from './conseillerInscription'
import {
  conseillerNumerique,
  conseillerNumeriqueMediateurId,
} from './conseillerNumerique'
import { conseillerSansLieuInscription } from './conseillerSansLieuInscription'
import { coordinateurHorsDispositifInscription } from './coordinateurHorsDispositifInscription'
import {
  coordinateurHorsDispositifInscritAvecTout,
  coordinateurHorsDispositifInscritAvecToutCoordinateurId,
} from './coordinateurHorsDispositifInscritAvecTout'
import { coordinateurInscription } from './coordinateurInscription'
import {
  coordinateurInscriptionAvecTout,
  coordinateurInscriptionAvecToutCoordinateurId,
} from './coordinateurInscriptionAvecTout'
import { coordinateurInscrit } from './coordinateurInscrit'
import {
  coordinateurInscritAvecTout,
  coordinateurInscritAvecToutCoordinateurId,
} from './coordinateurInscritAvecTout'
import {
  mediateurAvecActivite,
  mediateurAvecActiviteMediateurId,
} from './mediateurAvecActivite'
import { mediateurInscription } from './mediateurInscription'
import { mediateurSansActivites } from './mediateurSansActivites'

export const fixtureUsers = [
  administrateur,
  conseillerInscription,
  conseillerSansLieuInscription,
  conseillerNumerique,
  coordinateurHorsDispositifInscription,
  coordinateurHorsDispositifInscritAvecTout,
  mediateurInscription,
  mediateurSansActivites,
  mediateurAvecActivite,
  coordinateurInscription,
  coordinateurInscriptionAvecTout,
  coordinateurInscrit,
  coordinateurInscritAvecTout,
]

export const coordinations = [
  {
    coordinateurId: coordinateurInscriptionAvecToutCoordinateurId,
    mediateurIds: [
      conseillerNumeriqueMediateurId,
      mediateurAvecActiviteMediateurId,
    ],
  },
  {
    coordinateurId: coordinateurInscritAvecToutCoordinateurId,
    mediateurIds: [
      conseillerNumeriqueMediateurId,
      mediateurAvecActiviteMediateurId,
    ],
  },
  {
    coordinateurId: coordinateurHorsDispositifInscritAvecToutCoordinateurId,
    mediateurIds: [
      conseillerNumeriqueMediateurId,
      mediateurAvecActiviteMediateurId,
    ],
  },
]

export const teamMediateurs = [
  givenUser({
    id: 'e14d49a6-066f-44dd-9701-d6ab8452059f',
    firstName: 'Manon (test)',
    lastName: 'Galle',
    email: 'manon_galle@hotmail.com',
    role: 'User',
    inscriptionValidee: new Date(),
    lieuxActiviteRenseignes: new Date(),
    structureEmployeuseRenseignee: new Date(),
    mediateur: {
      connectOrCreate: {
        where: {
          id: '80366431-7f55-4e2f-b922-77f747a73152',
        },
        create: {
          id: '80366431-7f55-4e2f-b922-77f747a73152',
          enActivite: {
            connectOrCreate: {
              where: {
                id: '10470094-854a-4ebf-bf94-e632309a87ae',
              },
              create: {
                id: '10470094-854a-4ebf-bf94-e632309a87ae',
                structureId: mediateque.id,
              },
            },
          },
        },
      },
    },
    emplois: {
      connectOrCreate: {
        where: {
          id: '5f1fb5a2-1e8e-4d6d-892b-25ae1cbeabcc',
        },
        create: {
          id: '5f1fb5a2-1e8e-4d6d-892b-25ae1cbeabcc',
          structureId: structureEmployeuse.id,
        },
      },
    },
  }),
]

export const teamAdministrateurs = [
  givenUser({
    id: '99afd613-9d54-4110-9062-065c627eda8a',
    firstName: 'Hugues',
    lastName: 'Maignol',
    email: 'hugues.maignol@beta.gouv.fr',
    role: 'Admin',
  }),
  givenUser({
    id: 'eecac657-f415-47e1-8087-c4508ea16191',
    firstName: 'Marc',
    lastName: 'Gavanier',
    email: 'marc.gavanier@beta.gouv.fr',
    role: 'Admin',
  }),
  givenUser({
    id: '8e3c9cdc-3125-4c2e-a49e-796903e9989e',
    firstName: 'Thibault',
    lastName: 'Rouveyrol',
    email: 'thibault.rouveyrol@beta.gouv.fr',
    role: 'Admin',
  }),
  givenUser({
    id: '50439602-1437-443e-b6d0-25d96e21d60c',
    firstName: 'Manon',
    lastName: 'Galle',
    email: 'manon.galle@anct.gouv.fr',
    role: 'Admin',
  }),
  givenUser({
    id: '7faedd26-8603-4309-a614-062bba9161d8',
    email: 'sylvain.aubry@beta.gouv.fr',
    firstName: 'Sylvain',
    lastName: 'Aubry',
    role: 'Admin',
  }),
] satisfies Prisma.UserCreateInput[]
