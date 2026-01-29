import { refreshFixturesComputedFields } from '@app/fixtures/refreshFixturesComputedFields'
import { resetFixtureUser } from '@app/fixtures/resetFixtureUser'
import { mediateque, seedStructures } from '@app/fixtures/structures'
import {
  mediateurAvecActivite,
  mediateurAvecActiviteMediateurId,
} from '@app/fixtures/users/mediateurAvecActivite'
import { banDefaultValueToAdresseBanData } from '@app/web/external-apis/ban/banDefaultValueToAdresseBanData'
import { prismaClient } from '@app/web/prismaClient'
import { v4 } from 'uuid'
import { participantsAnonymesDefault } from '../collectif/validation/participantsAnonymes'
import {
  CreateOrUpdateActiviteInput,
  createOrUpdateActivite,
} from './createOrUpdateActivite'
import { deleteActivite } from './deleteActivite'

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

describe('deleteActivite', () => {
  beforeAll(async () => {
    await seedStructures(prismaClient)
    await resetFixtureUser(mediateurAvecActivite, false)
    await refreshFixturesComputedFields()
  })

  describe('individuel activities', () => {
    it('should delete individuel with anonymous beneficiaire and update counts', async () => {
      // Get initial counts
      const initialCounts = await getCounts({
        mediateurId: mediateurAvecActiviteMediateurId,
      })

      // Create individuel activity with anonymous beneficiaire
      const createInput: CreateOrUpdateActiviteInput = {
        type: 'Individuel',
        data: {
          mediateurId: mediateurAvecActiviteMediateurId,
          typeLieu: 'Domicile',
          thematiques: ['SecuriteNumerique'],
          tags: [],
          date: '2024-11-01',
          materiel: [],
          lieuCommuneData: banDefaultValueToAdresseBanData({
            commune: 'Paris',
            codePostal: '75001',
            codeInsee: '75056',
          }),
          duree: { duree: '60' },
          autonomie: 'EntierementAccompagne',
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
      })

      expect(afterCreateCounts.mediateur?.activitesCount).toBe(
        (initialCounts.mediateur?.activitesCount ?? 0) + 1,
      )
      expect(afterCreateCounts.mediateur?.accompagnementsCount).toBe(
        (initialCounts.mediateur?.accompagnementsCount ?? 0) + 1,
      )

      // Get the anonymous beneficiaire ID
      const accompagnement = await prismaClient.accompagnement.findFirst({
        where: { activiteId: createResult.id },
        select: { beneficiaireId: true },
      })

      // Delete the activity
      await deleteActivite({
        activiteId: createResult.id,
        sessionUserId: mediateurAvecActivite.id,
        mediateurId: mediateurAvecActiviteMediateurId,
      })

      // Verify counts after deletion - should be back to initial
      const afterDeleteCounts = await getCounts({
        mediateurId: mediateurAvecActiviteMediateurId,
      })

      expect(afterDeleteCounts.mediateur?.activitesCount).toBe(
        initialCounts.mediateur?.activitesCount ?? 0,
      )
      expect(afterDeleteCounts.mediateur?.accompagnementsCount).toBe(
        initialCounts.mediateur?.accompagnementsCount ?? 0,
      )

      // Verify activite is soft-deleted
      const deletedActivite = await prismaClient.activite.findUnique({
        where: { id: createResult.id },
        select: { suppression: true },
      })
      expect(deletedActivite?.suppression).not.toBeNull()

      // Verify anonymous beneficiaire was deleted
      const deletedBeneficiaire = await prismaClient.beneficiaire.findUnique({
        where: { id: accompagnement?.beneficiaireId },
      })
      expect(deletedBeneficiaire).toBeNull()
    })

    it('should reassign premierAccompagnement when deleting individuel with premierAccompagnement', async () => {
      // Create a beneficiaire suivi
      const beneficiaireId = v4()
      await prismaClient.beneficiaire.create({
        data: {
          id: beneficiaireId,
          mediateurId: mediateurAvecActiviteMediateurId,
          prenom: 'Premier',
          nom: 'Test',
          anonyme: false,
        },
      })

      try {
        // Create first activité (earlier date) - this will be premierAccompagnement
        const firstActiviteInput: CreateOrUpdateActiviteInput = {
          type: 'Individuel',
          data: {
            mediateurId: mediateurAvecActiviteMediateurId,
            typeLieu: 'Domicile',
            thematiques: ['SecuriteNumerique'],
            tags: [],
            date: '2024-10-01', // Earlier date
            materiel: [],
            lieuCommuneData: banDefaultValueToAdresseBanData({
              commune: 'Paris',
              codePostal: '75001',
              codeInsee: '75056',
            }),
            duree: { duree: '60' },
            autonomie: 'EntierementAccompagne',
            beneficiaire: { id: beneficiaireId },
          },
        }

        const firstActivite = await createOrUpdateActivite({
          input: firstActiviteInput,
          sessionUserId: mediateurAvecActivite.id,
          mediateurUserId: mediateurAvecActivite.id,
          mediateurId: mediateurAvecActiviteMediateurId,
        })

        // Create second activité (later date)
        const secondActiviteInput: CreateOrUpdateActiviteInput = {
          type: 'Individuel',
          data: {
            mediateurId: mediateurAvecActiviteMediateurId,
            typeLieu: 'Domicile',
            thematiques: ['SecuriteNumerique'],
            tags: [],
            date: '2024-10-15', // Later date
            materiel: [],
            lieuCommuneData: banDefaultValueToAdresseBanData({
              commune: 'Paris',
              codePostal: '75001',
              codeInsee: '75056',
            }),
            duree: { duree: '60' },
            autonomie: 'EntierementAccompagne',
            beneficiaire: { id: beneficiaireId },
          },
        }

        const secondActivite = await createOrUpdateActivite({
          input: secondActiviteInput,
          sessionUserId: mediateurAvecActivite.id,
          mediateurUserId: mediateurAvecActivite.id,
          mediateurId: mediateurAvecActiviteMediateurId,
        })

        // Verify first activité has premierAccompagnement
        const firstAccompagnement = await prismaClient.accompagnement.findFirst(
          {
            where: {
              activiteId: firstActivite.id,
              beneficiaireId,
            },
          },
        )
        expect(firstAccompagnement?.premierAccompagnement).toBe(true)

        // Verify second activité does NOT have premierAccompagnement
        const secondAccompagnement =
          await prismaClient.accompagnement.findFirst({
            where: {
              activiteId: secondActivite.id,
              beneficiaireId,
            },
          })
        expect(secondAccompagnement?.premierAccompagnement).toBe(false)

        // Delete the first activité (with premierAccompagnement)
        await deleteActivite({
          activiteId: firstActivite.id,
          sessionUserId: mediateurAvecActivite.id,
          mediateurId: mediateurAvecActiviteMediateurId,
        })

        // Verify second activité now has premierAccompagnement reassigned
        const updatedSecondAccompagnement =
          await prismaClient.accompagnement.findFirst({
            where: {
              activiteId: secondActivite.id,
              beneficiaireId,
            },
          })
        expect(updatedSecondAccompagnement?.premierAccompagnement).toBe(true)

        // Verify first accompagnement is deleted
        const deletedAccompagnement =
          await prismaClient.accompagnement.findFirst({
            where: {
              activiteId: firstActivite.id,
              beneficiaireId,
            },
          })
        expect(deletedAccompagnement).toBeNull()
      } finally {
        // Cleanup
        await prismaClient.accompagnement.deleteMany({
          where: { beneficiaireId },
        })
        await prismaClient.beneficiaire.delete({
          where: { id: beneficiaireId },
        })
      }
    })

    it('should delete individuel with structure and update structure count', async () => {
      // Get initial counts
      const initialCounts = await getCounts({
        mediateurId: mediateurAvecActiviteMediateurId,
        structureId: mediateque.id,
      })

      // Create individuel activity at mediateque
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
          date: '2024-11-02',
          materiel: [],
          duree: { duree: '60' },
          autonomie: 'EntierementAccompagne',
        },
      }

      const createResult = await createOrUpdateActivite({
        input: createInput,
        sessionUserId: mediateurAvecActivite.id,
        mediateurUserId: mediateurAvecActivite.id,
        mediateurId: mediateurAvecActiviteMediateurId,
      })

      // Verify structure count after creation
      const afterCreateCounts = await getCounts({
        mediateurId: mediateurAvecActiviteMediateurId,
        structureId: mediateque.id,
      })

      expect(afterCreateCounts.structure?.activitesCount).toBe(
        (initialCounts.structure?.activitesCount ?? 0) + 1,
      )

      // Delete the activity
      await deleteActivite({
        activiteId: createResult.id,
        sessionUserId: mediateurAvecActivite.id,
        mediateurId: mediateurAvecActiviteMediateurId,
      })

      // Verify structure count after deletion - should be back to initial
      const afterDeleteCounts = await getCounts({
        mediateurId: mediateurAvecActiviteMediateurId,
        structureId: mediateque.id,
      })

      expect(afterDeleteCounts.structure?.activitesCount).toBe(
        initialCounts.structure?.activitesCount ?? 0,
      )
    })
  })

  describe('collectif activities', () => {
    it('should delete collectif with multiple anonymous beneficiaires and update counts', async () => {
      const totalParticipants = 15

      // Get initial counts
      const initialCounts = await getCounts({
        mediateurId: mediateurAvecActiviteMediateurId,
      })

      // Create collectif activity with anonymous beneficiaires
      const createInput: CreateOrUpdateActiviteInput = {
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
          titreAtelier: 'Test deletion collectif',
          thematiques: ['SecuriteNumerique'],
          tags: [],
          date: '2024-11-03',
          materiel: [],
          duree: { duree: '120' },
          niveau: 'Debutant',
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
      })

      expect(afterCreateCounts.mediateur?.activitesCount).toBe(
        (initialCounts.mediateur?.activitesCount ?? 0) + 1,
      )
      expect(afterCreateCounts.mediateur?.accompagnementsCount).toBe(
        (initialCounts.mediateur?.accompagnementsCount ?? 0) +
          totalParticipants,
      )

      // Get the anonymous beneficiaires IDs
      const accompagnements = await prismaClient.accompagnement.findMany({
        where: { activiteId: createResult.id },
        select: { beneficiaireId: true },
      })
      const anonymeBeneficiaireIds = accompagnements.map(
        (a) => a.beneficiaireId,
      )

      expect(anonymeBeneficiaireIds.length).toBe(totalParticipants)

      // Delete the activity
      await deleteActivite({
        activiteId: createResult.id,
        sessionUserId: mediateurAvecActivite.id,
        mediateurId: mediateurAvecActiviteMediateurId,
      })

      // Verify counts after deletion - should be back to initial
      const afterDeleteCounts = await getCounts({
        mediateurId: mediateurAvecActiviteMediateurId,
      })

      expect(afterDeleteCounts.mediateur?.activitesCount).toBe(
        initialCounts.mediateur?.activitesCount ?? 0,
      )
      expect(afterDeleteCounts.mediateur?.accompagnementsCount).toBe(
        initialCounts.mediateur?.accompagnementsCount ?? 0,
      )

      // Verify activite is soft-deleted
      const deletedActivite = await prismaClient.activite.findUnique({
        where: { id: createResult.id },
        select: { suppression: true },
      })
      expect(deletedActivite?.suppression).not.toBeNull()

      // Verify all anonymous beneficiaires were deleted
      const deletedBeneficiaires = await prismaClient.beneficiaire.findMany({
        where: { id: { in: anonymeBeneficiaireIds } },
      })
      expect(deletedBeneficiaires.length).toBe(0)
    })

    it('should reassign premierAccompagnement when deleting collectif with premierAccompagnement', async () => {
      // Create a beneficiaire suivi
      const beneficiaireId = v4()
      await prismaClient.beneficiaire.create({
        data: {
          id: beneficiaireId,
          mediateurId: mediateurAvecActiviteMediateurId,
          prenom: 'Premier',
          nom: 'Collectif',
          anonyme: false,
        },
      })

      try {
        // Create first collectif (earlier date) - this will be premierAccompagnement
        const firstActiviteInput: CreateOrUpdateActiviteInput = {
          type: 'Collectif',
          data: {
            mediateurId: mediateurAvecActiviteMediateurId,
            typeLieu: 'Autre',
            participants: [{ id: beneficiaireId }],
            participantsAnonymes: {
              ...participantsAnonymesDefault,
              total: 0,
            },
            titreAtelier: 'First atelier',
            thematiques: ['SecuriteNumerique'],
            tags: [],
            date: '2024-10-01', // Earlier date
            materiel: [],
            duree: { duree: '120' },
            niveau: 'Debutant',
          },
        }

        const firstActivite = await createOrUpdateActivite({
          input: firstActiviteInput,
          sessionUserId: mediateurAvecActivite.id,
          mediateurUserId: mediateurAvecActivite.id,
          mediateurId: mediateurAvecActiviteMediateurId,
        })

        // Create second collectif (later date)
        const secondActiviteInput: CreateOrUpdateActiviteInput = {
          type: 'Collectif',
          data: {
            mediateurId: mediateurAvecActiviteMediateurId,
            typeLieu: 'Autre',
            participants: [{ id: beneficiaireId }],
            participantsAnonymes: {
              ...participantsAnonymesDefault,
              total: 0,
            },
            titreAtelier: 'Second atelier',
            thematiques: ['SecuriteNumerique'],
            tags: [],
            date: '2024-10-15', // Later date
            materiel: [],
            duree: { duree: '120' },
            niveau: 'Debutant',
          },
        }

        const secondActivite = await createOrUpdateActivite({
          input: secondActiviteInput,
          sessionUserId: mediateurAvecActivite.id,
          mediateurUserId: mediateurAvecActivite.id,
          mediateurId: mediateurAvecActiviteMediateurId,
        })

        // Verify first activité has premierAccompagnement
        const firstAccompagnement = await prismaClient.accompagnement.findFirst(
          {
            where: {
              activiteId: firstActivite.id,
              beneficiaireId,
            },
          },
        )
        expect(firstAccompagnement?.premierAccompagnement).toBe(true)

        // Verify second activité does NOT have premierAccompagnement
        const secondAccompagnement =
          await prismaClient.accompagnement.findFirst({
            where: {
              activiteId: secondActivite.id,
              beneficiaireId,
            },
          })
        expect(secondAccompagnement?.premierAccompagnement).toBe(false)

        // Delete the first activité (with premierAccompagnement)
        await deleteActivite({
          activiteId: firstActivite.id,
          sessionUserId: mediateurAvecActivite.id,
          mediateurId: mediateurAvecActiviteMediateurId,
        })

        // Verify second activité now has premierAccompagnement reassigned
        const updatedSecondAccompagnement =
          await prismaClient.accompagnement.findFirst({
            where: {
              activiteId: secondActivite.id,
              beneficiaireId,
            },
          })
        expect(updatedSecondAccompagnement?.premierAccompagnement).toBe(true)

        // Verify first accompagnement is deleted
        const deletedAccompagnement =
          await prismaClient.accompagnement.findFirst({
            where: {
              activiteId: firstActivite.id,
              beneficiaireId,
            },
          })
        expect(deletedAccompagnement).toBeNull()
      } finally {
        // Cleanup
        await prismaClient.accompagnement.deleteMany({
          where: { beneficiaireId },
        })
        await prismaClient.beneficiaire.delete({
          where: { id: beneficiaireId },
        })
      }
    })
  })

  describe('activities with beneficiaires suivis', () => {
    // Test IDs for this suite
    const beneficiaireA_Id = v4()
    const beneficiaireB_Id = v4()

    beforeAll(async () => {
      // Create non-anonymous beneficiaires (suivis) for testing
      await prismaClient.beneficiaire.createMany({
        data: [
          {
            id: beneficiaireA_Id,
            mediateurId: mediateurAvecActiviteMediateurId,
            prenom: 'Delete',
            nom: 'TestA',
            anonyme: false,
          },
          {
            id: beneficiaireB_Id,
            mediateurId: mediateurAvecActiviteMediateurId,
            prenom: 'Delete',
            nom: 'TestB',
            anonyme: false,
          },
        ],
      })
    })

    afterAll(async () => {
      // Clean up test beneficiaires
      await prismaClient.accompagnement.deleteMany({
        where: {
          beneficiaireId: { in: [beneficiaireA_Id, beneficiaireB_Id] },
        },
      })
      await prismaClient.beneficiaire.deleteMany({
        where: { id: { in: [beneficiaireA_Id, beneficiaireB_Id] } },
      })
    })

    it('should delete individuel with beneficiaire suivi and decrement their count', async () => {
      // Get initial counts
      const initialCounts = await getCounts({
        mediateurId: mediateurAvecActiviteMediateurId,
        beneficiaireIds: [beneficiaireA_Id],
      })

      // Create individuel activity with beneficiaire suivi
      const createInput: CreateOrUpdateActiviteInput = {
        type: 'Individuel',
        data: {
          mediateurId: mediateurAvecActiviteMediateurId,
          typeLieu: 'Domicile',
          thematiques: ['SecuriteNumerique'],
          tags: [],
          date: '2024-11-04',
          materiel: [],
          lieuCommuneData: banDefaultValueToAdresseBanData({
            commune: 'Paris',
            codePostal: '75001',
            codeInsee: '75056',
          }),
          duree: { duree: '60' },
          autonomie: 'EntierementAccompagne',
          beneficiaire: { id: beneficiaireA_Id },
        },
      }

      const createResult = await createOrUpdateActivite({
        input: createInput,
        mediateurUserId: mediateurAvecActivite.id,
        mediateurId: mediateurAvecActiviteMediateurId,
        sessionUserId: mediateurAvecActivite.id,
      })

      // Verify counts after creation
      const afterCreateCounts = await getCounts({
        mediateurId: mediateurAvecActiviteMediateurId,
        beneficiaireIds: [beneficiaireA_Id],
      })

      expect(afterCreateCounts.mediateur?.activitesCount).toBe(
        (initialCounts.mediateur?.activitesCount ?? 0) + 1,
      )
      expect(afterCreateCounts.mediateur?.accompagnementsCount).toBe(
        (initialCounts.mediateur?.accompagnementsCount ?? 0) + 1,
      )
      expect(afterCreateCounts.beneficiaires[beneficiaireA_Id]).toBe(
        (initialCounts.beneficiaires[beneficiaireA_Id] ?? 0) + 1,
      )

      // Delete the activity
      await deleteActivite({
        activiteId: createResult.id,
        sessionUserId: mediateurAvecActivite.id,
        mediateurId: mediateurAvecActiviteMediateurId,
      })

      // Verify counts after deletion - should be back to initial
      const afterDeleteCounts = await getCounts({
        mediateurId: mediateurAvecActiviteMediateurId,
        beneficiaireIds: [beneficiaireA_Id],
      })

      expect(afterDeleteCounts.mediateur?.activitesCount).toBe(
        initialCounts.mediateur?.activitesCount ?? 0,
      )
      expect(afterDeleteCounts.mediateur?.accompagnementsCount).toBe(
        initialCounts.mediateur?.accompagnementsCount ?? 0,
      )
      // Beneficiaire suivi count should be decremented (not deleted)
      expect(afterDeleteCounts.beneficiaires[beneficiaireA_Id]).toBe(
        initialCounts.beneficiaires[beneficiaireA_Id] ?? 0,
      )

      // Verify beneficiaire suivi still exists (not deleted)
      const beneficiaireSuivi = await prismaClient.beneficiaire.findUnique({
        where: { id: beneficiaireA_Id },
      })
      expect(beneficiaireSuivi).not.toBeNull()
      expect(beneficiaireSuivi?.anonyme).toBe(false)
    })

    it('should delete collectif with mixed suivis and anonymes, updating counts correctly', async () => {
      // Get initial counts
      const initialCounts = await getCounts({
        mediateurId: mediateurAvecActiviteMediateurId,
        structureId: mediateque.id,
        beneficiaireIds: [beneficiaireA_Id, beneficiaireB_Id],
      })

      // Create collectif with 2 suivis (A, B) + 5 anonymes
      const totalAnonymes = 5
      const createInput: CreateOrUpdateActiviteInput = {
        type: 'Collectif',
        data: {
          mediateurId: mediateurAvecActiviteMediateurId,
          typeLieu: 'LieuActivite',
          structure: {
            id: mediateque.id,
            nom: mediateque.nom,
            adresse: mediateque.adresse,
          },
          participants: [{ id: beneficiaireA_Id }, { id: beneficiaireB_Id }],
          participantsAnonymes: {
            ...participantsAnonymesDefault,
            total: totalAnonymes,
            genreNonCommunique: totalAnonymes,
            statutSocialNonCommunique: totalAnonymes,
            trancheAgeNonCommunique: totalAnonymes,
          },
          titreAtelier: 'Test deletion mixed',
          thematiques: ['SecuriteNumerique'],
          tags: [],
          date: '2024-11-05',
          materiel: [],
          duree: { duree: '120' },
          niveau: 'Debutant',
        },
      }

      const createResult = await createOrUpdateActivite({
        input: createInput,
        mediateurUserId: mediateurAvecActivite.id,
        mediateurId: mediateurAvecActiviteMediateurId,
        sessionUserId: mediateurAvecActivite.id,
      })

      // Verify counts after creation
      const afterCreateCounts = await getCounts({
        mediateurId: mediateurAvecActiviteMediateurId,
        structureId: mediateque.id,
        beneficiaireIds: [beneficiaireA_Id, beneficiaireB_Id],
      })

      const totalAccompagnements = 2 + totalAnonymes // 2 suivis + 5 anonymes

      expect(afterCreateCounts.mediateur?.activitesCount).toBe(
        (initialCounts.mediateur?.activitesCount ?? 0) + 1,
      )
      expect(afterCreateCounts.mediateur?.accompagnementsCount).toBe(
        (initialCounts.mediateur?.accompagnementsCount ?? 0) +
          totalAccompagnements,
      )
      expect(afterCreateCounts.structure?.activitesCount).toBe(
        (initialCounts.structure?.activitesCount ?? 0) + 1,
      )
      expect(afterCreateCounts.beneficiaires[beneficiaireA_Id]).toBe(
        (initialCounts.beneficiaires[beneficiaireA_Id] ?? 0) + 1,
      )
      expect(afterCreateCounts.beneficiaires[beneficiaireB_Id]).toBe(
        (initialCounts.beneficiaires[beneficiaireB_Id] ?? 0) + 1,
      )

      // Get anonymous beneficiaires IDs for verification
      const anonymeAccompagnements = await prismaClient.accompagnement.findMany(
        {
          where: {
            activiteId: createResult.id,
            beneficiaire: { anonyme: true },
          },
          select: { beneficiaireId: true },
        },
      )
      const anonymeBeneficiaireIds = anonymeAccompagnements.map(
        (a) => a.beneficiaireId,
      )
      expect(anonymeBeneficiaireIds.length).toBe(totalAnonymes)

      // Delete the activity
      await deleteActivite({
        activiteId: createResult.id,
        sessionUserId: mediateurAvecActivite.id,
        mediateurId: mediateurAvecActiviteMediateurId,
      })

      // Verify counts after deletion - should be back to initial
      const afterDeleteCounts = await getCounts({
        mediateurId: mediateurAvecActiviteMediateurId,
        structureId: mediateque.id,
        beneficiaireIds: [beneficiaireA_Id, beneficiaireB_Id],
      })

      expect(afterDeleteCounts.mediateur?.activitesCount).toBe(
        initialCounts.mediateur?.activitesCount ?? 0,
      )
      expect(afterDeleteCounts.mediateur?.accompagnementsCount).toBe(
        initialCounts.mediateur?.accompagnementsCount ?? 0,
      )
      expect(afterDeleteCounts.structure?.activitesCount).toBe(
        initialCounts.structure?.activitesCount ?? 0,
      )
      // Beneficiaires suivis counts should be decremented (not deleted)
      expect(afterDeleteCounts.beneficiaires[beneficiaireA_Id]).toBe(
        initialCounts.beneficiaires[beneficiaireA_Id] ?? 0,
      )
      expect(afterDeleteCounts.beneficiaires[beneficiaireB_Id]).toBe(
        initialCounts.beneficiaires[beneficiaireB_Id] ?? 0,
      )

      // Verify beneficiaires suivis still exist
      const beneficiairesSuivis = await prismaClient.beneficiaire.findMany({
        where: { id: { in: [beneficiaireA_Id, beneficiaireB_Id] } },
      })
      expect(beneficiairesSuivis.length).toBe(2)

      // Verify all anonymous beneficiaires were deleted
      const deletedAnonymes = await prismaClient.beneficiaire.findMany({
        where: { id: { in: anonymeBeneficiaireIds } },
      })
      expect(deletedAnonymes.length).toBe(0)
    })
  })
})
