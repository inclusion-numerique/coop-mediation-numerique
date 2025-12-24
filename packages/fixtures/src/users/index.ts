import { givenMediateur } from '@app/fixtures/givenMediateur'
import { givenUser } from '@app/fixtures/givenUser'
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
import { coordinateurInscritJ30 } from './coordinateurInscritJ30'
import { coordinateurInscritJ90 } from './coordinateurInscritJ90'
import { coordinateurInscritJ180 } from './coordinateurInscritJ180'
import {
  mediateurAvecActivite,
  mediateurAvecActiviteMediateurId,
} from './mediateurAvecActivite'
import { mediateurInscription } from './mediateurInscription'
import { mediateurInscriptionJ7 } from './mediateurInscriptionJ7'
import { mediateurInscriptionJ30 } from './mediateurInscriptionJ30'
import { mediateurInscriptionJ60 } from './mediateurInscriptionJ60'
import { mediateurInscriptionJ90 } from './mediateurInscriptionJ90'
import { mediateurInscriptionJ100 } from './mediateurInscriptionJ100'
import { mediateurInscriptionJ110 } from './mediateurInscriptionJ110'
import { mediateurSansActivites } from './mediateurSansActivites'
import { mediateurSansActivitesJ7 } from './mediateurSansActivitesJ7'
import { mediateurSansActivitesJ30 } from './mediateurSansActivitesJ30'
import { mediateurSansActivitesJ60 } from './mediateurSansActivitesJ60'
import { mediateurSansActivitesJ90 } from './mediateurSansActivitesJ90'

export const fixtureUsers = [
  administrateur,
  conseillerInscription,
  conseillerSansLieuInscription,
  conseillerNumerique,
  coordinateurHorsDispositifInscription,
  coordinateurHorsDispositifInscritAvecTout,
  mediateurInscription,
  mediateurInscriptionJ7,
  mediateurInscriptionJ30,
  mediateurInscriptionJ60,
  mediateurInscriptionJ90,
  mediateurInscriptionJ100,
  mediateurInscriptionJ110,
  mediateurSansActivites,
  mediateurSansActivitesJ7,
  mediateurSansActivitesJ30,
  mediateurSansActivitesJ60,
  mediateurSansActivitesJ90,
  mediateurAvecActivite,
  coordinateurInscription,
  coordinateurInscriptionAvecTout,
  coordinateurInscrit,
  coordinateurInscritJ30,
  coordinateurInscritJ90,
  coordinateurInscritJ180,
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
  givenMediateur({
    firstName: 'Manon (test)',
    lastName: 'Galle',
    email: 'manon_galle@hotmail.com',
    id: 'e14d49a6-066f-44dd-9701-d6ab8452059f',
    mediateurId: '80366431-7f55-4e2f-b922-77f747a73152',
    enActiviteId: '10470094-854a-4ebf-bf94-e632309a87ae',
    emploiId: '5f1fb5a2-1e8e-4d6d-892b-25ae1cbeabcc',
    featureFlags: ['Assistant'],
  }),
  givenMediateur({
    firstName: 'Hugues',
    lastName: 'Test',
    email: 'hugues.maignol@ext.anct.gouv.fr',
    id: '802372d4-26ab-4532-bb9e-fbd1a4cb8b54',
    mediateurId: '5b35afad-6904-4e76-980b-73f8b91c36ef',
    enActiviteId: 'eec12dc8-6e5b-4273-9238-79393e486716',
    emploiId: '2757f321-0f6a-4338-9a39-f4b25f3c0096',
    featureFlags: ['Assistant'],
  }),
]

// RDV SP team
export const rdvServicePublicStagingUsers = [
  {
    email: 'antoine.girard@beta.gouv.fr',
    firstName: 'Antoine',
    lastName: 'Girard',
    id: '465e20a2-4f3c-4730-ab36-6b8047f57ed8',
    mediateurId: '2a4d8569-1c63-4b24-a6a6-8d96c93a4ce7',
    enActiviteId: '8fb9d02f-05c6-4156-b114-3aefe9ae4472',
    emploiId: 'ee28b5f6-2fae-4040-85f8-165bbfe86448',
  },
  {
    email: 'lea.hauraix@beta.gouv.fr',
    firstName: 'Léa',
    lastName: 'Hauraix',
    id: '9559bf5c-bdb7-4702-bbba-548ccbe8b3f0',
    mediateurId: '47789eee-ab67-4da0-8f5c-4756d10ab799',
    enActiviteId: 'a3634280-ed49-491f-a5be-295c0e442e28',
    emploiId: '4526e09f-4e2c-4dc1-ad4a-2707a6f77649',
  },
  {
    email: 'teodora.stankiewicz@beta.gouv.fr',
    firstName: 'Teodora',
    lastName: 'Stankiewicz',
    id: '32962add-6f37-49ce-ae2b-b14065383999',
    mediateurId: 'd3e12f7b-b90c-4131-98a8-920aee892ff0',
    enActiviteId: 'e6d3fa12-2890-4fdc-af19-b884039feb28',
    emploiId: 'f436b27f-154d-4ea9-b395-1bbeeb524a37',
  },
  {
    email: 'mehdi.karouch.idrissi@beta.gouv.fr',
    firstName: 'Mehdi',
    lastName: 'Karouch Idrissi',
    id: '62a50bd5-3f21-4de7-8788-241dc4561552',
    mediateurId: '24a8e4e4-42ca-4508-8d6d-a20f006359cb',
    enActiviteId: 'a5a35e12-ed4f-4a97-849a-d6be3fa4688c',
    emploiId: 'd39b744d-2e9e-4b17-ae2d-44817eb31491',
  },
  {
    email: 'adrien.di_pasquale@beta.gouv.fr',
    firstName: 'Adrien',
    lastName: 'Di Pasquale',
    id: '7c84117c-77a6-48ea-9b08-b1c751536a4d',
    mediateurId: 'a2edcfa9-620e-489d-b879-68115d671ed9',
    enActiviteId: '169fba01-5ba0-49fc-bb47-07ac7e26e3eb',
    emploiId: 'd56c9539-653f-4ec1-8069-a05842cc009e',
  },
  {
    email: 'matis.alves@beta.gouv.fr',
    firstName: 'Matis',
    lastName: 'Alves',
    id: '059b8d18-8001-4b1b-9116-9aebbed886de',
    mediateurId: '3d0f712d-ea7b-490c-ba23-75b90df021c2',
    enActiviteId: '44d25627-71b7-42ea-a2ea-c48a8fb9850d',
    emploiId: '9a57a872-00dc-4b08-872d-99e31a48883e',
  },
  {
    email: 'francois.ferrandis@beta.gouv.fr',
    firstName: 'François',
    lastName: 'Ferrandis',
    id: 'a6e3c51e-6a9e-47f9-99a2-70fced98d897',
    mediateurId: 'b9cb5226-8dd3-48df-b6d7-86be77703f74',
    enActiviteId: '18a43b96-e123-4caa-91bf-f9d721878627',
    emploiId: '79c3bae9-7496-41dd-b9a9-a4a2ffed23fe',
  },
  {
    email: 'nesserine.zarouri@beta.gouv.fr',
    firstName: 'Nesserine',
    lastName: 'Zarouri',
    id: 'cea1e3a3-f882-4483-912b-4bd44cfbb1cf',
    mediateurId: 'c9a46caf-9764-4405-a658-873cb786d86d',
    enActiviteId: '46587759-c6ce-40fd-8683-20ad81ea74e0',
    emploiId: '1d877903-888b-47b9-8cb5-83434ec4dccf',
  },
  {
    email: 'victor.mours@beta.gouv.fr',
    firstName: 'Victor',
    lastName: 'Mours',
    id: '966e11bb-b35d-4cbc-9863-c46b6b3b8ef9',
    mediateurId: 'f575c0bc-39d0-413c-89b2-f151fc92bb76',
    enActiviteId: 'dd748ac8-c7d2-416e-9beb-d616519a5670',
    emploiId: '7f1dc3a8-a8e5-49da-85e6-89d3376fdad7',
  },
].map(givenMediateur)

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
