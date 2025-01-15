import type { Prisma } from '@prisma/client'
import { givenUser } from '@app/fixtures/givenUser'
import { administrateur } from './administrateur'
import { conseillerInscription } from './conseillerInscription'
import {
  conseillerNumerique,
  conseillerNumeriqueMediateurId,
} from './conseillerNumerique'
import { conseillerSansLieuInscription } from './conseillerSansLieuInscription'
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
import { mediateurInscriptionWithMediateur } from './mediateurInscriptionWithMediateur'
import { mediateurSansActivites } from './mediateurSansActivites'

export const fixtureUsers = [
  administrateur,
  conseillerInscription,
  conseillerSansLieuInscription,
  conseillerNumerique,
  mediateurInscription,
  mediateurInscriptionWithMediateur,
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
    id: '7d4ca05b-369b-4b3b-b42b-fc01a64c62d0',
    email: 'vincent.jarrige@beta.gouv.fr',
    firstName: 'Vincent',
    lastName: 'Jarrige',
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
