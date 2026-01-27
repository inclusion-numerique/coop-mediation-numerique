import { refreshFixturesComputedFields } from '@app/fixtures/refreshFixturesComputedFields'
import { resetFixtureUser } from '@app/fixtures/resetFixtureUser'
import { mediateque, seedStructures } from '@app/fixtures/structures'
import {
  mediateurAvecActivite,
  mediateurAvecActiviteMediateurId,
  mediateurAvecActiviteUserId,
} from '@app/fixtures/users/mediateurAvecActivite'
import { banDefaultValueToAdresseBanData } from '@app/web/external-apis/ban/banDefaultValueToAdresseBanData'
import { prismaClient } from '@app/web/prismaClient'
import { v4 } from 'uuid'
import {
  ActiviteListItemWithTimezone,
  activiteListSelect,
} from '../../list/db/activitesQueries'
import { CraCollectifData } from '../collectif/validation/CraCollectifValidation'
import { participantsAnonymesDefault } from '../collectif/validation/participantsAnonymes'
import { CraIndividuelData } from '../individuel/validation/CraIndividuelValidation'
import {
  CreateOrUpdateActiviteInput,
  createOrUpdateActivite,
} from './createOrUpdateActivite'
import { craDureeDataToMinutes } from './minutesToCraDuree'

// Helper to get counts for verification
const getCounts = async (ids: {
  mediateurId: string
  structureId?: string
  beneficiaireIds?: string[]
}) => {
  const [mediateur, structure, beneficiaires] = await Promise.all([
    prismaClient.mediateur.findUnique({
      where: { id: ids.mediateurId },
      select: { activitesCount: true, accompagnementsCount: true },
    }),
    ids.structureId
      ? prismaClient.structure.findUnique({
          where: { id: ids.structureId },
          select: { activitesCount: true },
        })
      : null,
    ids.beneficiaireIds && ids.beneficiaireIds.length > 0
      ? prismaClient.beneficiaire.findMany({
          where: { id: { in: ids.beneficiaireIds } },
          select: { id: true, accompagnementsCount: true },
        })
      : [],
  ])

  return {
    mediateur,
    structure,
    beneficiaires: beneficiaires.reduce(
      (acc, b) => {
        acc[b.id] = b.accompagnementsCount
        return acc
      },
      {} as Record<string, number>,
    ),
  }
}

const nullActivite: Omit<
  ActiviteListItemWithTimezone,
  | 'id'
  | 'type'
  | 'mediateurId'
  | 'accompagnements'
  | 'date'
  | 'duree'
  | 'timezone'
> = {
  autonomie: null,
  creation: expect.any(Date),
  lieuCodeInsee: null,
  lieuCodePostal: null,
  lieuCommune: null,
  materiel: [],
  modification: expect.any(Date),
  notes: null,
  orienteVersStructure: null,
  precisionsDemarche: null,
  structureDeRedirection: null,
  thematiques: [],
  tags: [],
  typeLieu: 'ADistance',
  niveau: null,
  structure: null,
  titreAtelier: null,
  rdvServicePublicId: null,
  mediateur: {
    id: '303381cc-3da7-433d-a553-1a5f76465989',
    user: {
      firstName: 'Médiateur',
      lastName: 'Avec activités',
      isConseillerNumerique: false,
    },
  },
  v1CraId: null,
  rdv: null,
}

describe('createOrUpdateActivite', () => {
  beforeAll(async () => {
    await seedStructures(prismaClient)
    await resetFixtureUser(mediateurAvecActivite, false)
    await refreshFixturesComputedFields()
  })

  it('should create activite individuelle for anonyme', async () => {
    const input: {
      type: 'Individuel'
      data: CraIndividuelData
    } = {
      type: 'Individuel',
      data: {
        mediateurId: mediateurAvecActiviteMediateurId,
        typeLieu: 'Domicile',
        thematiques: ['SecuriteNumerique'],
        tags: [],
        date: '2024-08-01',
        materiel: [],
        lieuCommuneData: banDefaultValueToAdresseBanData({
          commune: 'Paris',
          codePostal: '75001',
          codeInsee: '75056',
        }),
        duree: {
          duree: 'personnaliser',
          dureePersonnaliseeMinutes: 90,
        },
        autonomie: 'EntierementAccompagne',
        // TODO integration test with rdv ids
        // rdvServicePublicId: 2_000_000_000,
      },
    } satisfies CreateOrUpdateActiviteInput

    const result = await createOrUpdateActivite({
      input,
      sessionUserId: mediateurAvecActiviteUserId,
      mediateurUserId: mediateurAvecActiviteUserId,
      mediateurId: mediateurAvecActiviteMediateurId,
    })

    const activite = await prismaClient.activite.findUnique({
      where: {
        id: result.id,
      },
      select: activiteListSelect,
    })

    expect(activite).toEqual({
      ...nullActivite,
      id: result.id,
      type: 'Individuel',
      mediateurId: mediateurAvecActiviteMediateurId,
      accompagnements: [
        {
          premierAccompagnement: true,
          beneficiaire: expect.objectContaining({
            id: expect.any(String),
            anonyme: true,
            attributionsAleatoires: false,
          }),
        },
      ],
      autonomie: input.data.autonomie,
      date: new Date(input.data.date),
      duree: craDureeDataToMinutes(input.data.duree),
      lieuCodeInsee: input.data.lieuCommuneData?.codeInsee ?? null,
      lieuCodePostal: input.data.lieuCommuneData?.codePostal ?? null,
      lieuCommune: input.data.lieuCommuneData?.commune ?? null,
      materiel: input.data.materiel,
      notes: input.data.notes ?? null,
      orienteVersStructure: input.data.orienteVersStructure ?? null,
      structureDeRedirection: input.data.structureDeRedirection ?? null,
      thematiques: input.data.thematiques,
      typeLieu: input.data.typeLieu,
      rdvServicePublicId: input.data.rdvServicePublicId ?? null,
      v1CraId: null,
    })
  })

  it('should create and update activite individuelle for single anonyme', async () => {
    const input: {
      type: 'Individuel'
      data: CraIndividuelData
    } = {
      type: 'Individuel',
      data: {
        mediateurId: mediateurAvecActiviteMediateurId,
        typeLieu: 'Domicile',
        thematiques: ['SecuriteNumerique'],
        tags: [],
        date: '2024-08-01',
        materiel: [],
        lieuCommuneData: banDefaultValueToAdresseBanData({
          commune: 'Paris',
          codePostal: '75001',
          codeInsee: '75056',
        }),
        duree: {
          duree: '90',
        },
        autonomie: 'EntierementAccompagne',
      },
    } satisfies CreateOrUpdateActiviteInput

    const resultToUpdate = await createOrUpdateActivite({
      input,
      sessionUserId: mediateurAvecActiviteUserId,
      mediateurUserId: mediateurAvecActiviteUserId,
      mediateurId: mediateurAvecActiviteMediateurId,
    })

    const result = await createOrUpdateActivite({
      input: {
        ...input,
        data: {
          ...input.data,
          id: resultToUpdate.id,
        },
      },
      sessionUserId: mediateurAvecActiviteUserId,
      mediateurUserId: mediateurAvecActiviteUserId,
      mediateurId: mediateurAvecActiviteMediateurId,
    })

    const accompagnementAnonyme = await prismaClient.accompagnement.findMany({
      where: {
        activiteId: result.id,
        beneficiaire: {
          anonyme: true,
        },
      },
    })

    expect(accompagnementAnonyme.length).toBe(1)
  })

  it('should create atelier collectif for anonyme', async () => {
    const input: {
      type: 'Collectif'
      data: CraCollectifData
    } = {
      type: 'Collectif',
      data: {
        mediateurId: mediateurAvecActiviteMediateurId,
        typeLieu: 'Autre',
        participants: [],
        participantsAnonymes: {
          ...participantsAnonymesDefault,
          total: 10,
          genreNonCommunique: 10,
          statutSocialScolarise: 2,
          statutSocialEnEmploi: 7,
          statutSocialNonCommunique: 1,
          trancheAgeMoinsDeDouze: 2,
          trancheAgeDixHuitVingtQuatre: 2,
          trancheAgeVingtCinqTrenteNeuf: 2,
          trancheAgeQuaranteCinquanteNeuf: 2,
          trancheAgeSoixanteSoixanteNeuf: 1,
          trancheAgeSoixanteDixPlus: 1,
        },
        titreAtelier: 'Titre atelier',
        thematiques: ['SecuriteNumerique'],
        tags: [],
        date: '2024-08-01',
        materiel: [],
        duree: {
          duree: 'personnaliser',
          dureePersonnaliseeHeures: 1,
          dureePersonnaliseeMinutes: 30,
        },
        niveau: 'Avance',
      },
    } satisfies CreateOrUpdateActiviteInput

    const result = await createOrUpdateActivite({
      input,
      sessionUserId: mediateurAvecActiviteUserId,
      mediateurUserId: mediateurAvecActiviteUserId,
      mediateurId: mediateurAvecActiviteMediateurId,
    })

    const activite = await prismaClient.activite.findUnique({
      where: {
        id: result.id,
      },
      select: activiteListSelect,
    })

    expect(activite).toEqual({
      ...nullActivite,
      id: result.id,
      type: 'Collectif',
      mediateurId: mediateurAvecActiviteMediateurId,
      // expect an array of 10 participants object containing anonyme
      accompagnements: expect.arrayContaining(
        Array.from({ length: 10 }).fill({
          beneficiaire: expect.objectContaining({
            id: expect.any(String),
            anonyme: true,
            attributionsAleatoires: true,
          }),
          premierAccompagnement: true,
        }),
      ),
      niveau: 'Avance',
      date: new Date(input.data.date),
      duree: craDureeDataToMinutes(input.data.duree),
      titreAtelier: input.data.titreAtelier,
      materiel: input.data.materiel,
      notes: input.data.notes ?? null,
      typeLieu: input.data.typeLieu,
      thematiques: input.data.thematiques,
      rdvServicePublicId: input.data.rdvServicePublicId ?? null,
      v1CraId: null,
    })
  })

  it('should create and update large atelier collectif (50+ participants) without timeout', async () => {
    const totalParticipants = 60

    const input: CreateOrUpdateActiviteInput = {
      type: 'Collectif',
      data: {
        mediateurId: mediateurAvecActiviteMediateurId,
        typeLieu: 'Autre',
        participants: [],
        participantsAnonymes: {
          ...participantsAnonymesDefault,
          total: totalParticipants,
          genreNonCommunique: totalParticipants,
          statutSocialNonCommunique: totalParticipants,
          trancheAgeNonCommunique: totalParticipants,
        },
        titreAtelier: 'Grand atelier collectif',
        thematiques: ['SecuriteNumerique', 'DiagnosticNumerique'],
        tags: [],
        date: '2024-09-15',
        materiel: ['Ordinateur', 'Telephone'],
        duree: { duree: '180' },
        niveau: 'Debutant',
      },
    }

    // Test creation
    const createResult = await createOrUpdateActivite({
      input,
      sessionUserId: mediateurAvecActivite.id,
      mediateurUserId: mediateurAvecActivite.id,
      mediateurId: mediateurAvecActiviteMediateurId,
    })

    const createdActivite = await prismaClient.activite.findUnique({
      where: { id: createResult.id },
      select: {
        accompagnementsCount: true,
        _count: { select: { accompagnements: true } },
      },
    })

    expect(createdActivite?.accompagnementsCount).toBe(totalParticipants)
    expect(createdActivite?._count.accompagnements).toBe(totalParticipants)

    // Test update with different participant count
    const updatedTotalParticipants = 45
    const updateInput: CreateOrUpdateActiviteInput = {
      type: 'Collectif',
      data: {
        ...input.data,
        id: createResult.id,
        participantsAnonymes: {
          ...participantsAnonymesDefault,
          total: updatedTotalParticipants,
          genreNonCommunique: updatedTotalParticipants,
          statutSocialNonCommunique: updatedTotalParticipants,
          trancheAgeNonCommunique: updatedTotalParticipants,
        },
        titreAtelier: 'Grand atelier collectif modifié',
      },
    }

    const updateResult = await createOrUpdateActivite({
      input: updateInput,
      sessionUserId: mediateurAvecActivite.id,
      mediateurUserId: mediateurAvecActivite.id,
      mediateurId: mediateurAvecActiviteMediateurId,
    })

    expect(updateResult.id).toBe(createResult.id)

    const updatedActivite = await prismaClient.activite.findUnique({
      where: { id: updateResult.id },
      select: {
        accompagnementsCount: true,
        titreAtelier: true,
        _count: { select: { accompagnements: true } },
      },
    })

    expect(updatedActivite?.accompagnementsCount).toBe(updatedTotalParticipants)
    expect(updatedActivite?._count.accompagnements).toBe(
      updatedTotalParticipants,
    )
    expect(updatedActivite?.titreAtelier).toBe(
      'Grand atelier collectif modifié',
    )
  })

  describe('counts verification', () => {
    // Test IDs for this suite - fresh IDs to avoid conflicts with other tests
    const beneficiaireA_Id = v4()
    const beneficiaireB_Id = v4()
    const beneficiaireC_Id = v4()

    beforeAll(async () => {
      // Create 3 non-anonymous beneficiaires (suivis) for testing
      await prismaClient.beneficiaire.createMany({
        data: [
          {
            id: beneficiaireA_Id,
            mediateurId: mediateurAvecActiviteMediateurId,
            prenom: 'Test',
            nom: 'BeneficiaireA',
            anonyme: false,
          },
          {
            id: beneficiaireB_Id,
            mediateurId: mediateurAvecActiviteMediateurId,
            prenom: 'Test',
            nom: 'BeneficiaireB',
            anonyme: false,
          },
          {
            id: beneficiaireC_Id,
            mediateurId: mediateurAvecActiviteMediateurId,
            prenom: 'Test',
            nom: 'BeneficiaireC',
            anonyme: false,
          },
        ],
      })
    })

    afterAll(async () => {
      // Clean up test beneficiaires
      await prismaClient.accompagnement.deleteMany({
        where: {
          beneficiaireId: {
            in: [beneficiaireA_Id, beneficiaireB_Id, beneficiaireC_Id],
          },
        },
      })
      await prismaClient.beneficiaire.deleteMany({
        where: {
          id: { in: [beneficiaireA_Id, beneficiaireB_Id, beneficiaireC_Id] },
        },
      })
    })

    it('should correctly update all counts when switching beneficiaires suivis on update', async () => {
      // Get initial counts
      const initialCounts = await getCounts({
        mediateurId: mediateurAvecActiviteMediateurId,
        structureId: mediateque.id,
        beneficiaireIds: [beneficiaireA_Id, beneficiaireB_Id, beneficiaireC_Id],
      })

      // Step 1: Create activity with beneficiaire A at mediateque
      const createInput: CreateOrUpdateActiviteInput = {
        type: 'Individuel',
        data: {
          mediateurId: mediateurAvecActiviteMediateurId,
          typeLieu: 'LieuActivite',
          structure: {
            id: mediateque.id,
            nom: mediateque.nom,
            adresse: mediateque.adresse,
          },
          thematiques: ['SecuriteNumerique'],
          tags: [],
          date: '2024-10-01',
          materiel: [],
          duree: { duree: '60' },
          autonomie: 'EntierementAccompagne',
          beneficiaire: { id: beneficiaireA_Id },
        },
      }

      const createResult = await createOrUpdateActivite({
        input: createInput,
        sessionUserId: mediateurAvecActivite.id,
        mediateurUserId: mediateurAvecActivite.id,
        mediateurId: mediateurAvecActiviteMediateurId,
      })

      // Verify counts after creation
      const afterCreateCounts = await getCounts({
        mediateurId: mediateurAvecActiviteMediateurId,
        structureId: mediateque.id,
        beneficiaireIds: [beneficiaireA_Id, beneficiaireB_Id, beneficiaireC_Id],
      })

      expect(afterCreateCounts.mediateur?.activitesCount).toBe(
        (initialCounts.mediateur?.activitesCount ?? 0) + 1,
      )
      expect(afterCreateCounts.mediateur?.accompagnementsCount).toBe(
        (initialCounts.mediateur?.accompagnementsCount ?? 0) + 1,
      )
      expect(afterCreateCounts.structure?.activitesCount).toBe(
        (initialCounts.structure?.activitesCount ?? 0) + 1,
      )
      expect(afterCreateCounts.beneficiaires[beneficiaireA_Id]).toBe(
        (initialCounts.beneficiaires[beneficiaireA_Id] ?? 0) + 1,
      )
      expect(afterCreateCounts.beneficiaires[beneficiaireB_Id]).toBe(
        initialCounts.beneficiaires[beneficiaireB_Id] ?? 0,
      )

      // Step 2: Update activity - change from beneficiaire A to beneficiaire B
      const updateInput: CreateOrUpdateActiviteInput = {
        type: 'Individuel',
        data: {
          ...createInput.data,
          id: createResult.id,
          beneficiaire: { id: beneficiaireB_Id },
        },
      }

      await createOrUpdateActivite({
        input: updateInput,
        sessionUserId: mediateurAvecActivite.id,
        mediateurUserId: mediateurAvecActivite.id,
        mediateurId: mediateurAvecActiviteMediateurId,
      })

      // Verify counts after switching beneficiaire
      const afterSwitchCounts = await getCounts({
        mediateurId: mediateurAvecActiviteMediateurId,
        structureId: mediateque.id,
        beneficiaireIds: [beneficiaireA_Id, beneficiaireB_Id, beneficiaireC_Id],
      })

      // Mediateur counts should stay the same (1 activite, 1 accompagnement)
      expect(afterSwitchCounts.mediateur?.activitesCount).toBe(
        afterCreateCounts.mediateur?.activitesCount,
      )
      expect(afterSwitchCounts.mediateur?.accompagnementsCount).toBe(
        afterCreateCounts.mediateur?.accompagnementsCount,
      )
      // Structure count should stay the same
      expect(afterSwitchCounts.structure?.activitesCount).toBe(
        afterCreateCounts.structure?.activitesCount,
      )
      // Beneficiaire A should be decremented back to initial
      expect(afterSwitchCounts.beneficiaires[beneficiaireA_Id]).toBe(
        initialCounts.beneficiaires[beneficiaireA_Id] ?? 0,
      )
      // Beneficiaire B should be incremented
      expect(afterSwitchCounts.beneficiaires[beneficiaireB_Id]).toBe(
        (initialCounts.beneficiaires[beneficiaireB_Id] ?? 0) + 1,
      )

      // Step 3: Update activity - change structure (from mediateque to no structure)
      const updateNoStructureInput: CreateOrUpdateActiviteInput = {
        type: 'Individuel',
        data: {
          ...updateInput.data,
          typeLieu: 'Domicile',
          structure: undefined,
          lieuCommuneData: banDefaultValueToAdresseBanData({
            commune: 'Paris',
            codePostal: '75001',
            codeInsee: '75056',
          }),
        },
      }

      await createOrUpdateActivite({
        input: updateNoStructureInput,
        sessionUserId: mediateurAvecActivite.id,
        mediateurUserId: mediateurAvecActivite.id,
        mediateurId: mediateurAvecActiviteMediateurId,
      })

      // Verify structure count is decremented
      const afterStructureChangeCounts = await getCounts({
        mediateurId: mediateurAvecActiviteMediateurId,
        structureId: mediateque.id,
        beneficiaireIds: [beneficiaireA_Id, beneficiaireB_Id],
      })

      expect(afterStructureChangeCounts.structure?.activitesCount).toBe(
        initialCounts.structure?.activitesCount ?? 0,
      )

      // Clean up: soft-delete the test activity
      await prismaClient.activite.update({
        where: { id: createResult.id },
        data: { suppression: new Date() },
      })
    })

    it('should correctly handle collectif with mixed suivis and anonymes', async () => {
      const initialCounts = await getCounts({
        mediateurId: mediateurAvecActiviteMediateurId,
        beneficiaireIds: [beneficiaireA_Id, beneficiaireB_Id, beneficiaireC_Id],
      })

      // Create collectif with 2 suivis (A, B) + 5 anonymes
      const createInput: CreateOrUpdateActiviteInput = {
        type: 'Collectif',
        data: {
          mediateurId: mediateurAvecActiviteMediateurId,
          typeLieu: 'Autre',
          participants: [{ id: beneficiaireA_Id }, { id: beneficiaireB_Id }],
          participantsAnonymes: {
            ...participantsAnonymesDefault,
            total: 5,
            genreNonCommunique: 5,
            statutSocialNonCommunique: 5,
            trancheAgeNonCommunique: 5,
          },
          titreAtelier: 'Test counts mixed',
          thematiques: ['SecuriteNumerique'],
          tags: [],
          date: '2024-10-02',
          materiel: [],
          duree: { duree: '90' },
          niveau: 'Debutant',
        },
      }

      const createResult = await createOrUpdateActivite({
        input: createInput,
        sessionUserId: mediateurAvecActivite.id,
        mediateurUserId: mediateurAvecActivite.id,
        mediateurId: mediateurAvecActiviteMediateurId,
      })

      const afterCreateCounts = await getCounts({
        mediateurId: mediateurAvecActiviteMediateurId,
        beneficiaireIds: [beneficiaireA_Id, beneficiaireB_Id, beneficiaireC_Id],
      })

      // Mediateur: +1 activite, +7 accompagnements (2 suivis + 5 anonymes)
      expect(afterCreateCounts.mediateur?.activitesCount).toBe(
        (initialCounts.mediateur?.activitesCount ?? 0) + 1,
      )
      expect(afterCreateCounts.mediateur?.accompagnementsCount).toBe(
        (initialCounts.mediateur?.accompagnementsCount ?? 0) + 7,
      )
      // Beneficiaire A and B: +1 each
      expect(afterCreateCounts.beneficiaires[beneficiaireA_Id]).toBe(
        (initialCounts.beneficiaires[beneficiaireA_Id] ?? 0) + 1,
      )
      expect(afterCreateCounts.beneficiaires[beneficiaireB_Id]).toBe(
        (initialCounts.beneficiaires[beneficiaireB_Id] ?? 0) + 1,
      )
      // Beneficiaire C: unchanged
      expect(afterCreateCounts.beneficiaires[beneficiaireC_Id]).toBe(
        initialCounts.beneficiaires[beneficiaireC_Id] ?? 0,
      )

      // Update: change to 1 suivi (B, C) + 3 anonymes (remove A, add C)
      const updateInput: CreateOrUpdateActiviteInput = {
        type: 'Collectif',
        data: {
          ...createInput.data,
          id: createResult.id,
          participants: [{ id: beneficiaireB_Id }, { id: beneficiaireC_Id }],
          participantsAnonymes: {
            ...participantsAnonymesDefault,
            total: 3,
            genreNonCommunique: 3,
            statutSocialNonCommunique: 3,
            trancheAgeNonCommunique: 3,
          },
        },
      }

      await createOrUpdateActivite({
        input: updateInput,
        sessionUserId: mediateurAvecActivite.id,
        mediateurUserId: mediateurAvecActivite.id,
        mediateurId: mediateurAvecActiviteMediateurId,
      })

      const afterUpdateCounts = await getCounts({
        mediateurId: mediateurAvecActiviteMediateurId,
        beneficiaireIds: [beneficiaireA_Id, beneficiaireB_Id, beneficiaireC_Id],
      })

      // Mediateur: same activites, accompagnements changed from 7 to 5
      expect(afterUpdateCounts.mediateur?.activitesCount).toBe(
        afterCreateCounts.mediateur?.activitesCount,
      )
      expect(afterUpdateCounts.mediateur?.accompagnementsCount).toBe(
        (initialCounts.mediateur?.accompagnementsCount ?? 0) + 5,
      )
      // Beneficiaire A: back to initial (was removed)
      expect(afterUpdateCounts.beneficiaires[beneficiaireA_Id]).toBe(
        initialCounts.beneficiaires[beneficiaireA_Id] ?? 0,
      )
      // Beneficiaire B: still +1 (was kept)
      expect(afterUpdateCounts.beneficiaires[beneficiaireB_Id]).toBe(
        (initialCounts.beneficiaires[beneficiaireB_Id] ?? 0) + 1,
      )
      // Beneficiaire C: now +1 (was added)
      expect(afterUpdateCounts.beneficiaires[beneficiaireC_Id]).toBe(
        (initialCounts.beneficiaires[beneficiaireC_Id] ?? 0) + 1,
      )

      // Clean up
      await prismaClient.activite.update({
        where: { id: createResult.id },
        data: { suppression: new Date() },
      })
    })
  })

  describe('premierAccompagnement date-based logic', () => {
    const beneficiaireTestId = v4()

    beforeAll(async () => {
      // Create a non-anonymous beneficiaire for testing
      await prismaClient.beneficiaire.create({
        data: {
          id: beneficiaireTestId,
          mediateurId: mediateurAvecActiviteMediateurId,
          prenom: 'Premier',
          nom: 'TestBeneficiaire',
          anonyme: false,
        },
      })
    })

    afterAll(async () => {
      // Clean up test beneficiaire and their accompagnements
      await prismaClient.accompagnement.deleteMany({
        where: { beneficiaireId: beneficiaireTestId },
      })
      await prismaClient.beneficiaire.delete({
        where: { id: beneficiaireTestId },
      })
    })

    const getAccompagnementPremier = async (beneficiaireId: string) => {
      const accompagnement = await prismaClient.accompagnement.findFirst({
        where: { beneficiaireId, premierAccompagnement: true },
        include: { activite: { select: { date: true } } },
      })
      return accompagnement
    }

    it('should set premierAccompagnement on first activity for new beneficiaire', async () => {
      const input: CreateOrUpdateActiviteInput = {
        type: 'Individuel',
        data: {
          mediateurId: mediateurAvecActiviteMediateurId,
          typeLieu: 'ADistance',
          thematiques: ['SecuriteNumerique'],
          tags: [],
          date: '2024-06-15',
          materiel: [],
          duree: { duree: '60' },
          autonomie: 'EntierementAccompagne',
          beneficiaire: { id: beneficiaireTestId },
        },
      }

      const result = await createOrUpdateActivite({
        input,
        sessionUserId: mediateurAvecActivite.id,
        mediateurUserId: mediateurAvecActivite.id,
        mediateurId: mediateurAvecActiviteMediateurId,
      })

      const premier = await getAccompagnementPremier(beneficiaireTestId)
      expect(premier).not.toBeNull()
      expect(premier?.activiteId).toBe(result.id)

      // Clean up
      await prismaClient.activite.update({
        where: { id: result.id },
        data: { suppression: new Date() },
      })
    })

    it('should set premierAccompagnement on earliest activity by date', async () => {
      // Create later activity first (July)
      const laterInput: CreateOrUpdateActiviteInput = {
        type: 'Individuel',
        data: {
          mediateurId: mediateurAvecActiviteMediateurId,
          typeLieu: 'ADistance',
          thematiques: ['SecuriteNumerique'],
          tags: [],
          date: '2024-07-15',
          materiel: [],
          duree: { duree: '60' },
          autonomie: 'EntierementAccompagne',
          beneficiaire: { id: beneficiaireTestId },
        },
      }

      const laterResult = await createOrUpdateActivite({
        input: laterInput,
        sessionUserId: mediateurAvecActivite.id,
        mediateurUserId: mediateurAvecActivite.id,
        mediateurId: mediateurAvecActiviteMediateurId,
      })

      // Verify later activity is premier (only one so far)
      let premier = await getAccompagnementPremier(beneficiaireTestId)
      expect(premier?.activiteId).toBe(laterResult.id)

      // Create earlier activity (May)
      const earlierInput: CreateOrUpdateActiviteInput = {
        type: 'Individuel',
        data: {
          mediateurId: mediateurAvecActiviteMediateurId,
          typeLieu: 'ADistance',
          thematiques: ['DiagnosticNumerique'],
          tags: [],
          date: '2024-05-01',
          materiel: [],
          duree: { duree: '90' },
          autonomie: 'PartiellementAutonome',
          beneficiaire: { id: beneficiaireTestId },
        },
      }

      const earlierResult = await createOrUpdateActivite({
        input: earlierInput,
        sessionUserId: mediateurAvecActivite.id,
        mediateurUserId: mediateurAvecActivite.id,
        mediateurId: mediateurAvecActiviteMediateurId,
      })

      // Verify premier switched to the earlier activity
      premier = await getAccompagnementPremier(beneficiaireTestId)
      expect(premier?.activiteId).toBe(earlierResult.id)

      // Clean up
      await prismaClient.activite.updateMany({
        where: { id: { in: [laterResult.id, earlierResult.id] } },
        data: { suppression: new Date() },
      })
    })

    it('should update premierAccompagnement when changing activity date', async () => {
      // Create two activities
      const firstInput: CreateOrUpdateActiviteInput = {
        type: 'Individuel',
        data: {
          mediateurId: mediateurAvecActiviteMediateurId,
          typeLieu: 'ADistance',
          thematiques: ['SecuriteNumerique'],
          tags: [],
          date: '2024-03-01', // Earlier
          materiel: [],
          duree: { duree: '60' },
          autonomie: 'EntierementAccompagne',
          beneficiaire: { id: beneficiaireTestId },
        },
      }

      const firstResult = await createOrUpdateActivite({
        input: firstInput,
        sessionUserId: mediateurAvecActivite.id,
        mediateurUserId: mediateurAvecActivite.id,
        mediateurId: mediateurAvecActiviteMediateurId,
      })

      const secondInput: CreateOrUpdateActiviteInput = {
        type: 'Individuel',
        data: {
          mediateurId: mediateurAvecActiviteMediateurId,
          typeLieu: 'ADistance',
          thematiques: ['DiagnosticNumerique'],
          tags: [],
          date: '2024-04-01', // Later
          materiel: [],
          duree: { duree: '60' },
          autonomie: 'Autonome',
          beneficiaire: { id: beneficiaireTestId },
        },
      }

      const secondResult = await createOrUpdateActivite({
        input: secondInput,
        sessionUserId: mediateurAvecActivite.id,
        mediateurUserId: mediateurAvecActivite.id,
        mediateurId: mediateurAvecActiviteMediateurId,
      })

      // First should be premier
      let premier = await getAccompagnementPremier(beneficiaireTestId)
      expect(premier?.activiteId).toBe(firstResult.id)

      // Update first activity to have a later date
      const updateInput: CreateOrUpdateActiviteInput = {
        type: 'Individuel',
        data: {
          ...firstInput.data,
          id: firstResult.id,
          date: '2024-05-01', // Now later than second
        },
      }

      await createOrUpdateActivite({
        input: updateInput,
        sessionUserId: mediateurAvecActivite.id,
        mediateurUserId: mediateurAvecActivite.id,
        mediateurId: mediateurAvecActiviteMediateurId,
      })

      // Second should now be premier
      premier = await getAccompagnementPremier(beneficiaireTestId)
      expect(premier?.activiteId).toBe(secondResult.id)

      // Clean up
      await prismaClient.activite.updateMany({
        where: { id: { in: [firstResult.id, secondResult.id] } },
        data: { suppression: new Date() },
      })
    })

    it('should handle premierAccompagnement when beneficiaire switches between activities', async () => {
      const otherBeneficiaireId = v4()

      // Create another beneficiaire
      await prismaClient.beneficiaire.create({
        data: {
          id: otherBeneficiaireId,
          mediateurId: mediateurAvecActiviteMediateurId,
          prenom: 'Other',
          nom: 'Beneficiaire',
          anonyme: false,
        },
      })

      // Create activity with beneficiaireTestId
      const input: CreateOrUpdateActiviteInput = {
        type: 'Individuel',
        data: {
          mediateurId: mediateurAvecActiviteMediateurId,
          typeLieu: 'ADistance',
          thematiques: ['SecuriteNumerique'],
          tags: [],
          date: '2024-02-01',
          materiel: [],
          duree: { duree: '60' },
          autonomie: 'EntierementAccompagne',
          beneficiaire: { id: beneficiaireTestId },
        },
      }

      const result = await createOrUpdateActivite({
        input,
        sessionUserId: mediateurAvecActivite.id,
        mediateurUserId: mediateurAvecActivite.id,
        mediateurId: mediateurAvecActiviteMediateurId,
      })

      // beneficiaireTestId should have premier
      let premier = await getAccompagnementPremier(beneficiaireTestId)
      expect(premier?.activiteId).toBe(result.id)

      // Update to switch to otherBeneficiaireId
      const updateInput: CreateOrUpdateActiviteInput = {
        type: 'Individuel',
        data: {
          ...input.data,
          id: result.id,
          beneficiaire: { id: otherBeneficiaireId },
        },
      }

      await createOrUpdateActivite({
        input: updateInput,
        sessionUserId: mediateurAvecActivite.id,
        mediateurUserId: mediateurAvecActivite.id,
        mediateurId: mediateurAvecActiviteMediateurId,
      })

      // beneficiaireTestId should no longer have premier for this activity
      premier = await getAccompagnementPremier(beneficiaireTestId)
      expect(premier?.activiteId).not.toBe(result.id)

      // otherBeneficiaireId should have premier
      const otherPremier = await getAccompagnementPremier(otherBeneficiaireId)
      expect(otherPremier?.activiteId).toBe(result.id)

      // Clean up
      await prismaClient.activite.update({
        where: { id: result.id },
        data: { suppression: new Date() },
      })
      await prismaClient.accompagnement.deleteMany({
        where: { beneficiaireId: otherBeneficiaireId },
      })
      await prismaClient.beneficiaire.delete({
        where: { id: otherBeneficiaireId },
      })
    })
  })
})
