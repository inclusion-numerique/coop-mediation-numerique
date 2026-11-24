import { administrateur } from '@/features/utilisateurs/fixtures/administrateur'
import { conseillerInscriptionSansContrat } from '@/features/utilisateurs/fixtures/conseillers/conseiller-inscription-sans-contrat'
import {
  conseillerNumerique,
  conseillerNumeriqueMediateurId,
} from '@/features/utilisateurs/fixtures/conseillers/conseiller-numerique'
import { conseillerSansLieuInscription } from '@/features/utilisateurs/fixtures/conseillers/conseiller-sans-lieu-inscription'
import {
  exConseillerApresRupture,
  exConseillerApresRuptureMediateurId,
} from '@/features/utilisateurs/fixtures/conseillers/ex-conseiller-apres-rupture'
import { coordinateurHorsDispositifInscription } from '@/features/utilisateurs/fixtures/coordinateurs/coordinateur-hors-dispositif-inscription'
import {
  coordinateurHorsDispositifInscritAvecTout,
  coordinateurHorsDispositifInscritAvecToutCoordinateurId,
  coordinateurHorsDispositifInscritAvecToutMediateurId,
} from '@/features/utilisateurs/fixtures/coordinateurs/coordinateur-hors-dispositif-inscrit-avec-tout'
import { coordinateurInscription } from '@/features/utilisateurs/fixtures/coordinateurs/coordinateur-inscription'
import {
  coordinateurInscriptionAvecTout,
  coordinateurInscriptionAvecToutCoordinateurId,
  coordinateurInscriptionAvecToutMediateurId,
} from '@/features/utilisateurs/fixtures/coordinateurs/coordinateur-inscription-avec-tout'
import { coordinateurInscrit } from '@/features/utilisateurs/fixtures/coordinateurs/coordinateur-inscrit'
import {
  coordinateurInscritAvecTout,
  coordinateurInscritAvecToutMediateurId,
} from '@/features/utilisateurs/fixtures/coordinateurs/coordinateur-inscrit-avec-tout'
import { coordinateurInscritJ7 } from '@/features/utilisateurs/fixtures/coordinateurs/coordinateur-inscrit-j7'
import { coordinateurInscritJ30 } from '@/features/utilisateurs/fixtures/coordinateurs/coordinateur-inscrit-j30'
import { coordinateurInscritJ60 } from '@/features/utilisateurs/fixtures/coordinateurs/coordinateur-inscrit-j60'
import { coordinateurInscritJ90 } from '@/features/utilisateurs/fixtures/coordinateurs/coordinateur-inscrit-j90'
import { coordinateurInscritJ100 } from '@/features/utilisateurs/fixtures/coordinateurs/coordinateur-inscrit-j100'
import { coordinateurInscritJ110 } from '@/features/utilisateurs/fixtures/coordinateurs/coordinateur-inscrit-j110'
import { coordinateurInscritJ180 } from '@/features/utilisateurs/fixtures/coordinateurs/coordinateur-inscrit-j180'
import { mediateurCoordinateurJ7 } from '@/features/utilisateurs/fixtures/coordinateurs/mediateur-coordinateur-j7'
import { mediateurCoordinateurJ30 } from '@/features/utilisateurs/fixtures/coordinateurs/mediateur-coordinateur-j30'
import { mediateurCoordinateurJ60 } from '@/features/utilisateurs/fixtures/coordinateurs/mediateur-coordinateur-j60'
import { mediateurCoordinateurJ90 } from '@/features/utilisateurs/fixtures/coordinateurs/mediateur-coordinateur-j90'
import { mediateurCoordinateurJ100 } from '@/features/utilisateurs/fixtures/coordinateurs/mediateur-coordinateur-j100'
import { mediateurCoordinateurJ110 } from '@/features/utilisateurs/fixtures/coordinateurs/mediateur-coordinateur-j110'
import { mediateur } from '@/features/utilisateurs/fixtures/mediateur'
import {
  mediateurAvecActivite,
  mediateurAvecActiviteMediateurId,
} from '@/features/utilisateurs/fixtures/mediateurs/mediateur-avec-activite'
import { mediateurInscription } from '@/features/utilisateurs/fixtures/mediateurs/mediateur-inscription'
import { mediateurInscriptionJ7 } from '@/features/utilisateurs/fixtures/mediateurs/mediateur-inscription-j7'
import { mediateurInscriptionJ30 } from '@/features/utilisateurs/fixtures/mediateurs/mediateur-inscription-j30'
import { mediateurInscriptionJ60 } from '@/features/utilisateurs/fixtures/mediateurs/mediateur-inscription-j60'
import { mediateurInscriptionJ90 } from '@/features/utilisateurs/fixtures/mediateurs/mediateur-inscription-j90'
import { mediateurInscriptionJ100 } from '@/features/utilisateurs/fixtures/mediateurs/mediateur-inscription-j100'
import { mediateurInscriptionJ110 } from '@/features/utilisateurs/fixtures/mediateurs/mediateur-inscription-j110'
import {
  mediateurSansActivites,
  mediateurSansActivitesMediateurId,
} from '@/features/utilisateurs/fixtures/mediateurs/mediateur-sans-activites'
import { mediateurSansActivitesJ7 } from '@/features/utilisateurs/fixtures/mediateurs/mediateur-sans-activites-j7'
import { mediateurSansActivitesJ30 } from '@/features/utilisateurs/fixtures/mediateurs/mediateur-sans-activites-j30'
import { mediateurSansActivitesJ60 } from '@/features/utilisateurs/fixtures/mediateurs/mediateur-sans-activites-j60'
import { mediateurSansActivitesJ90 } from '@/features/utilisateurs/fixtures/mediateurs/mediateur-sans-activites-j90'
import { mediateurSansActivitesJ100 } from '@/features/utilisateurs/fixtures/mediateurs/mediateur-sans-activites-j100'
import { mediateurSansActivitesJ110 } from '@/features/utilisateurs/fixtures/mediateurs/mediateur-sans-activites-j110'
import { mediateurSansEmployeuseInscription } from '@/features/utilisateurs/fixtures/mediateurs/mediateur-sans-employeuse-inscription'
import { utilisateur } from '@/features/utilisateurs/fixtures/utilisateur'
import type { Prisma } from '@/generated/prisma/client'

export const personas = [
  administrateur,
  conseillerInscriptionSansContrat,
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
  mediateurSansEmployeuseInscription,
  mediateurSansActivites,
  mediateurSansActivitesJ7,
  mediateurSansActivitesJ30,
  mediateurSansActivitesJ60,
  mediateurSansActivitesJ90,
  mediateurSansActivitesJ100,
  mediateurSansActivitesJ110,
  mediateurAvecActivite,
  mediateurCoordinateurJ7,
  mediateurCoordinateurJ30,
  mediateurCoordinateurJ60,
  mediateurCoordinateurJ90,
  mediateurCoordinateurJ100,
  mediateurCoordinateurJ110,
  coordinateurInscription,
  coordinateurInscriptionAvecTout,
  coordinateurInscrit,
  coordinateurInscritJ7,
  coordinateurInscritJ30,
  coordinateurInscritJ60,
  coordinateurInscritJ90,
  coordinateurInscritJ100,
  coordinateurInscritJ110,
  coordinateurInscritJ180,
  coordinateurInscritAvecTout,
  exConseillerApresRupture,
]

export const mediateursDesPersonas = {
  conseillerNumerique: conseillerNumeriqueMediateurId,
  coordinateurHorsDispositifInscritAvecTout:
    coordinateurHorsDispositifInscritAvecToutMediateurId,
  coordinateurInscriptionAvecTout: coordinateurInscriptionAvecToutMediateurId,
  coordinateurInscritAvecTout: coordinateurInscritAvecToutMediateurId,
  exConseillerApresRupture: exConseillerApresRuptureMediateurId,
  mediateurAvecActivite: mediateurAvecActiviteMediateurId,
  mediateurSansActivites: mediateurSansActivitesMediateurId,
}

export const coordinations = [
  {
    coordinateurId: coordinateurInscriptionAvecToutCoordinateurId,
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

const membresDeLEquipeProduit = [
  {
    firstName: 'Manon (test)',
    lastName: 'Galle',
    email: 'manon_galle@hotmail.com',
    id: 'e14d49a6-066f-44dd-9701-d6ab8452059f',
    mediateurId: '80366431-7f55-4e2f-b922-77f747a73152',
    emploiId: '5f1fb5a2-1e8e-4d6d-892b-25ae1cbeabcc',
  },
  {
    firstName: 'Hugues',
    lastName: 'Test',
    email: 'hugues.maignol@ext.anct.gouv.fr',
    id: '802372d4-26ab-4532-bb9e-fbd1a4cb8b54',
    mediateurId: '5b35afad-6904-4e76-980b-73f8b91c36ef',
    emploiId: '2757f321-0f6a-4338-9a39-f4b25f3c0096',
  },
]

export const mediateursDeLEquipe = membresDeLEquipeProduit.map(mediateur)

const equipeRdvServicePublic = [
  {
    email: 'antoine.girard@beta.gouv.fr',
    firstName: 'Antoine',
    lastName: 'Girard',
    id: '465e20a2-4f3c-4730-ab36-6b8047f57ed8',
    mediateurId: '2a4d8569-1c63-4b24-a6a6-8d96c93a4ce7',
    emploiId: 'ee28b5f6-2fae-4040-85f8-165bbfe86448',
  },
  {
    email: 'lea.hauraix@beta.gouv.fr',
    firstName: 'Léa',
    lastName: 'Hauraix',
    id: '9559bf5c-bdb7-4702-bbba-548ccbe8b3f0',
    mediateurId: '47789eee-ab67-4da0-8f5c-4756d10ab799',
    emploiId: '4526e09f-4e2c-4dc1-ad4a-2707a6f77649',
  },
  {
    email: 'teodora.stankiewicz@beta.gouv.fr',
    firstName: 'Teodora',
    lastName: 'Stankiewicz',
    id: '32962add-6f37-49ce-ae2b-b14065383999',
    mediateurId: 'd3e12f7b-b90c-4131-98a8-920aee892ff0',
    emploiId: 'f436b27f-154d-4ea9-b395-1bbeeb524a37',
  },
  {
    email: 'mehdi.karouch.idrissi@beta.gouv.fr',
    firstName: 'Mehdi',
    lastName: 'Karouch Idrissi',
    id: '62a50bd5-3f21-4de7-8788-241dc4561552',
    mediateurId: '24a8e4e4-42ca-4508-8d6d-a20f006359cb',
    emploiId: 'd39b744d-2e9e-4b17-ae2d-44817eb31491',
  },
  {
    email: 'adrien.di_pasquale@beta.gouv.fr',
    firstName: 'Adrien',
    lastName: 'Di Pasquale',
    id: '7c84117c-77a6-48ea-9b08-b1c751536a4d',
    mediateurId: 'a2edcfa9-620e-489d-b879-68115d671ed9',
    emploiId: 'd56c9539-653f-4ec1-8069-a05842cc009e',
  },
  {
    email: 'matis.alves@beta.gouv.fr',
    firstName: 'Matis',
    lastName: 'Alves',
    id: '059b8d18-8001-4b1b-9116-9aebbed886de',
    mediateurId: '3d0f712d-ea7b-490c-ba23-75b90df021c2',
    emploiId: '9a57a872-00dc-4b08-872d-99e31a48883e',
  },
  {
    email: 'francois.ferrandis@beta.gouv.fr',
    firstName: 'François',
    lastName: 'Ferrandis',
    id: 'a6e3c51e-6a9e-47f9-99a2-70fced98d897',
    mediateurId: 'b9cb5226-8dd3-48df-b6d7-86be77703f74',
    emploiId: '79c3bae9-7496-41dd-b9a9-a4a2ffed23fe',
  },
  {
    email: 'nesserine.zarouri@beta.gouv.fr',
    firstName: 'Nesserine',
    lastName: 'Zarouri',
    id: 'cea1e3a3-f882-4483-912b-4bd44cfbb1cf',
    mediateurId: 'c9a46caf-9764-4405-a658-873cb786d86d',
    emploiId: '1d877903-888b-47b9-8cb5-83434ec4dccf',
  },
  {
    email: 'victor.mours@beta.gouv.fr',
    firstName: 'Victor',
    lastName: 'Mours',
    id: '966e11bb-b35d-4cbc-9863-c46b6b3b8ef9',
    mediateurId: 'f575c0bc-39d0-413c-89b2-f151fc92bb76',
    emploiId: '7f1dc3a8-a8e5-49da-85e6-89d3376fdad7',
  },
  {
    email: 'marc.gavanier@beta.gouv.fr',
    firstName: 'Marc',
    lastName: 'Gavanier',
    id: 'eecac657-f415-47e1-8087-c4508ea16191',
    mediateurId: '7fb83a1d-684e-4575-b14f-06d941b47716',
    emploiId: 'c30bb705-48ad-4e5c-8ad4-e836e4394388',
  },
]

export const utilisateursDeRecetteRdv = equipeRdvServicePublic.map(mediateur)

export const mediateursDesEquipesProduit = [
  ...membresDeLEquipeProduit,
  ...equipeRdvServicePublic,
].map(({ mediateurId }) => mediateurId)

export const administrateursDeLEquipe = [
  utilisateur({
    id: '50439602-1437-443e-b6d0-25d96e21d60c',
    firstName: 'Manon',
    lastName: 'Galle',
    email: 'manon.galle@anct.gouv.fr',
    role: 'Admin',
  }),
  utilisateur({
    id: '82658fa2-b0ed-4fe8-8120-b462048957a0',
    firstName: 'Ferdinand',
    lastName: 'Rautureau',
    email: 'ferdinand.rautureau@anct.gouv.fr',
    role: 'Admin',
  }),
  utilisateur({
    id: '1e8fa942-0491-41c7-a28c-b68da6b05a1c',
    firstName: 'Kévin',
    lastName: 'Troadec',
    email: 'kevin.troadec@beta.gouv.fr',
    role: 'Admin',
  }),
  utilisateur({
    id: 'c059170d-cf32-452c-b3db-e05e2658ff49',
    firstName: 'Adrien',
    lastName: 'Turpin',
    email: 'adrien.turpin@ext.anct.gouv.fr',
    role: 'Admin',
  }),
  utilisateur({
    id: 'a1b2c3d4-1111-4000-8000-000000000003',
    firstName: 'David',
    lastName: 'Bourchanin',
    email: 'david.bourchanin@ext.anct.gouv.fr',
    role: 'Admin',
  }),
] satisfies Prisma.UserCreateInput[]
