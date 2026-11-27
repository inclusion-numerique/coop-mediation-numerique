import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { prismaClient } from '@/configuration/prisma'
import { BeneficiaireId } from '@/features/beneficiaire/domain/beneficiaire-id'
import { Email } from '@/features/beneficiaire/domain/email'
import { MediateurId } from '@/features/beneficiaire/domain/mediateur-id'
import { Nom } from '@/features/beneficiaire/domain/nom'
import { Prenom } from '@/features/beneficiaire/domain/prenom'
import { beneficiaire } from '@/features/beneficiaire/fixtures/beneficiaire'
import { Telephone } from '@/libraries/telephone'
import { findDuplicatesForBeneficiaire as findDuplicateForBeneficiaire } from './find-duplicates-for-beneficiaire.query'

const withBrandedFields = (fixture: {
  id: string
  mediateurId: string
  nom: string | null
  prenom: string | null
  telephone: string | null
  email: string | null
}) => ({
  id: BeneficiaireId(fixture.id),
  mediateurId: MediateurId(fixture.mediateurId),
  nom: fixture.nom ? Nom(fixture.nom) : null,
  prenom: fixture.prenom ? Prenom(fixture.prenom) : null,
  telephone: fixture.telephone ? Telephone(fixture.telephone) : null,
  email: fixture.email ? Email(fixture.email) : null,
})

const UTILISATEUR = '4f59e05a-ce35-4c17-81fb-1716152596aa'
const testMediateurId = '31825eb3-b6cb-4c1d-a272-5a5768304a96'

const beneficiaireMueller = beneficiaire({
  id: 'e1111111-1111-1111-1111-111111111111',
  prenom: 'Hans',
  nom: 'Mueller',
  email: 'hans.mueller@test.com',
  mediateurId: testMediateurId,
})

const beneficiaireMuller = beneficiaire({
  id: 'e2222222-2222-2222-2222-222222222222',
  prenom: 'Hans',
  nom: 'Müller',
  email: 'hans.muller@test.com',
  mediateurId: testMediateurId,
})

const beneficiaireJeanPierre = beneficiaire({
  id: 'e3333333-3333-3333-3333-333333333333',
  prenom: 'Jean-Pierre',
  nom: 'Dupont',
  email: 'jp.dupont@test.com',
  mediateurId: testMediateurId,
})

const beneficiaireJeanPierreNoHyphen = beneficiaire({
  id: 'e4444444-4444-4444-4444-444444444444',
  prenom: 'Jean Pierre',
  nom: 'Dupont',
  email: 'jeanpierre.dupont@test.com',
  mediateurId: testMediateurId,
})

const beneficiaireSameEmail1 = beneficiaire({
  id: 'e5555555-5555-5555-5555-555555555555',
  prenom: 'Alice',
  nom: 'Martin',
  email: 'same.email@test.com',
  telephone: Telephone('0601020304'),
  mediateurId: testMediateurId,
})

const beneficiaireSameEmail2 = beneficiaire({
  id: 'e6666666-6666-6666-6666-666666666666',
  prenom: 'Alicia',
  nom: 'Martinez',
  email: 'same.email@test.com',
  telephone: Telephone('0601020304'),
  mediateurId: testMediateurId,
})

const beneficiaireLegacyTarget = beneficiaire({
  id: 'e7777777-7777-7777-7777-777777777777',
  prenom: 'Bob',
  nom: 'Legacy',
  email: 'legacy.match@test.com',
  mediateurId: testMediateurId,
})

const beneficiaireLegacyBadPhone = beneficiaire({
  id: 'e8888888-8888-8888-8888-888888888888',
  prenom: 'Bob',
  nom: 'Legacy',
  email: 'legacy.match@test.com',
  mediateurId: testMediateurId,
})

const legacyInvalidTelephone = 'NUMERO-LEGACY-INVALIDE'

describe('findDuplicateForBeneficiaire', () => {
  beforeAll(async () => {
    const ensureMediateur = {
      connectOrCreate: {
        where: { id: testMediateurId },
        create: { id: testMediateurId },
      },
    }
    await prismaClient.user.upsert({
      where: { id: UTILISATEUR },
      update: { mediateur: ensureMediateur },
      create: {
        id: UTILISATEUR,
        role: 'User',
        isFixture: true,
        email: `test-doublons-${Date.now()}@test.com`,
        mediateur: ensureMediateur,
      },
    })

    await prismaClient.beneficiaire.deleteMany({
      where: {
        id: {
          in: [
            beneficiaireMueller.id,
            beneficiaireMuller.id,
            beneficiaireJeanPierre.id,
            beneficiaireJeanPierreNoHyphen.id,
            beneficiaireSameEmail1.id,
            beneficiaireSameEmail2.id,
            beneficiaireLegacyTarget.id,
            beneficiaireLegacyBadPhone.id,
          ],
        },
      },
    })

    await prismaClient.beneficiaire.createMany({
      data: [
        beneficiaireMueller,
        beneficiaireMuller,
        beneficiaireJeanPierre,
        beneficiaireJeanPierreNoHyphen,
        beneficiaireSameEmail1,
        beneficiaireSameEmail2,
        beneficiaireLegacyTarget,
        beneficiaireLegacyBadPhone,
      ],
    })

    await prismaClient.beneficiaire.update({
      where: { id: beneficiaireLegacyBadPhone.id },
      data: { telephone: legacyInvalidTelephone },
    })
  })

  afterAll(async () => {
    await prismaClient.beneficiaire.deleteMany({
      where: {
        id: {
          in: [
            beneficiaireMueller.id,
            beneficiaireMuller.id,
            beneficiaireJeanPierre.id,
            beneficiaireJeanPierreNoHyphen.id,
            beneficiaireSameEmail1.id,
            beneficiaireSameEmail2.id,
            beneficiaireLegacyTarget.id,
            beneficiaireLegacyBadPhone.id,
          ],
        },
      },
    })
  })

  describe('exact matching (fuzzyMatching: false)', () => {
    it('should find duplicates with same normalized names (Jean-Pierre vs Jean Pierre)', async () => {
      const duplicates = await findDuplicateForBeneficiaire({
        beneficiaire: withBrandedFields(beneficiaireJeanPierre),
        withConflictingFields: 'include',
        fuzzyMatching: false,
        maintenant: new Date(),
      })

      expect(duplicates).toHaveLength(1)
      expect(duplicates[0]?.id).toBe(beneficiaireJeanPierreNoHyphen.id)
    })

    it('should NOT find Mueller/Müller as duplicates (different after unaccent)', async () => {
      const duplicates = await findDuplicateForBeneficiaire({
        beneficiaire: withBrandedFields(beneficiaireMueller),
        withConflictingFields: 'include',
        fuzzyMatching: false,
        maintenant: new Date(),
      })

      expect(duplicates).toHaveLength(0)
    })

    it('should find duplicates with same email and phone', async () => {
      const duplicates = await findDuplicateForBeneficiaire({
        beneficiaire: withBrandedFields(beneficiaireSameEmail1),
        withConflictingFields: 'include',
        fuzzyMatching: false,
        maintenant: new Date(),
      })

      expect(duplicates).toHaveLength(1)
      expect(duplicates[0]?.id).toBe(beneficiaireSameEmail2.id)
    })
  })

  describe('fuzzy matching (fuzzyMatching: true)', () => {
    it('should find Mueller/Müller as duplicates with fuzzy matching', async () => {
      const duplicates = await findDuplicateForBeneficiaire({
        beneficiaire: withBrandedFields(beneficiaireMueller),
        withConflictingFields: 'include',
        fuzzyMatching: true,
        maintenant: new Date(),
      })

      expect(duplicates).toHaveLength(1)
      expect(duplicates[0]?.id).toBe(beneficiaireMuller.id)
    })

    it('should still find exact matches', async () => {
      const duplicates = await findDuplicateForBeneficiaire({
        beneficiaire: withBrandedFields(beneficiaireJeanPierre),
        withConflictingFields: 'include',
        fuzzyMatching: true,
        maintenant: new Date(),
      })

      expect(duplicates).toHaveLength(1)
      expect(duplicates[0]?.id).toBe(beneficiaireJeanPierreNoHyphen.id)
    })

    it('should still find duplicates with same email and phone', async () => {
      const duplicates = await findDuplicateForBeneficiaire({
        beneficiaire: withBrandedFields(beneficiaireSameEmail1),
        withConflictingFields: 'include',
        fuzzyMatching: true,
        maintenant: new Date(),
      })

      expect(duplicates).toHaveLength(1)
      expect(duplicates[0]?.id).toBe(beneficiaireSameEmail2.id)
    })
  })

  describe('withConflictingFields behavior', () => {
    it('should exclude conflicts when withConflictingFields is exclude', async () => {
      const duplicates = await findDuplicateForBeneficiaire({
        beneficiaire: withBrandedFields(beneficiaireSameEmail1),
        withConflictingFields: 'exclude',
        fuzzyMatching: false,
        maintenant: new Date(),
      })

      expect(duplicates).toHaveLength(0)
    })

    it('should include conflicts when withConflictingFields is include', async () => {
      const duplicates = await findDuplicateForBeneficiaire({
        beneficiaire: withBrandedFields(beneficiaireSameEmail1),
        withConflictingFields: 'include',
        fuzzyMatching: false,
        maintenant: new Date(),
      })

      expect(duplicates).toHaveLength(1)
      expect(duplicates[0]?.id).toBe(beneficiaireSameEmail2.id)
    })
  })

  describe('résilience aux données legacy invalides', () => {
    it('ne throw pas sur un candidat au téléphone legacy invalide et le rend avec téléphone null', async () => {
      const duplicates = await findDuplicateForBeneficiaire({
        beneficiaire: withBrandedFields(beneficiaireLegacyTarget),
        withConflictingFields: 'include',
        fuzzyMatching: false,
        maintenant: new Date(),
      })

      const candidate = duplicates.find(
        (duplicate) => duplicate.id === beneficiaireLegacyBadPhone.id,
      )
      expect(candidate).toBeDefined()
      expect(candidate?.telephone).toBeNull()
    })
  })
})
