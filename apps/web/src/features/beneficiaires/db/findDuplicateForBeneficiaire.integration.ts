import { givenBeneficiaire } from '@app/fixtures/givenBeneficiaire'
import {
  mediateurSansActivitesMediateurId,
  mediateurSansActivitesUserId,
} from '@app/fixtures/users/mediateurSansActivites'
import { findDuplicatesForBeneficiaire as findDuplicateForBeneficiaire } from '@app/web/features/beneficiaire/abilities/detecter-doublons/implementation'
import { BeneficiaireId } from '@app/web/features/beneficiaire/domain/beneficiaire-id'
import { Email } from '@app/web/features/beneficiaire/domain/email'
import { MediateurId } from '@app/web/features/beneficiaire/domain/mediateur-id'
import { Nom } from '@app/web/features/beneficiaire/domain/nom'
import { Prenom } from '@app/web/features/beneficiaire/domain/prenom'
import { Telephone } from '@app/web/features/beneficiaire/domain/telephone'
import { prismaClient } from '@app/web/prismaClient'

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

const testMediateurId = mediateurSansActivitesMediateurId

// Test beneficiaires with similar names for fuzzy matching tests
const beneficiaireMueller = givenBeneficiaire({
  id: 'e1111111-1111-1111-1111-111111111111',
  prenom: 'Hans',
  nom: 'Mueller',
  email: 'hans.mueller@test.com',
  mediateurId: testMediateurId,
})

const beneficiaireMuller = givenBeneficiaire({
  id: 'e2222222-2222-2222-2222-222222222222',
  prenom: 'Hans',
  nom: 'Müller',
  email: 'hans.muller@test.com',
  mediateurId: testMediateurId,
})

// Test beneficiaires with exact match (same normalized name)
const beneficiaireJeanPierre = givenBeneficiaire({
  id: 'e3333333-3333-3333-3333-333333333333',
  prenom: 'Jean-Pierre',
  nom: 'Dupont',
  email: 'jp.dupont@test.com',
  mediateurId: testMediateurId,
})

const beneficiaireJeanPierreNoHyphen = givenBeneficiaire({
  id: 'e4444444-4444-4444-4444-444444444444',
  prenom: 'Jean Pierre',
  nom: 'Dupont',
  email: 'jeanpierre.dupont@test.com',
  mediateurId: testMediateurId,
})

// Test beneficiaires with same email (should always match)
const beneficiaireSameEmail1 = givenBeneficiaire({
  id: 'e5555555-5555-5555-5555-555555555555',
  prenom: 'Alice',
  nom: 'Martin',
  email: 'same.email@test.com',
  telephone: '0601020304',
  mediateurId: testMediateurId,
})

const beneficiaireSameEmail2 = givenBeneficiaire({
  id: 'e6666666-6666-6666-6666-666666666666',
  prenom: 'Alicia',
  nom: 'Martinez',
  email: 'same.email@test.com',
  telephone: '0601020304',
  mediateurId: testMediateurId,
})

describe('findDuplicateForBeneficiaire', () => {
  beforeAll(async () => {
    // Ensure mediateur exists (make test self-contained)
    await prismaClient.user.upsert({
      where: { id: mediateurSansActivitesUserId },
      update: {},
      create: {
        id: mediateurSansActivitesUserId,
        role: 'User',
        isFixture: true,
        email: `test-doublons-${Date.now()}@test.com`,
        mediateur: {
          connectOrCreate: {
            where: { id: testMediateurId },
            create: { id: testMediateurId },
          },
        },
      },
    })

    // Clean up test beneficiaires
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
          ],
        },
      },
    })

    // Create test beneficiaires
    await prismaClient.beneficiaire.createMany({
      data: [
        beneficiaireMueller,
        beneficiaireMuller,
        beneficiaireJeanPierre,
        beneficiaireJeanPierreNoHyphen,
        beneficiaireSameEmail1,
        beneficiaireSameEmail2,
      ],
    })
  })

  afterAll(async () => {
    // Clean up test beneficiaires
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
      })

      // "Jean-Pierre" and "Jean Pierre" normalize to same value (jeanpierre)
      // So they should match with exact matching
      expect(duplicates).toHaveLength(1)
      expect(duplicates[0].id).toBe(beneficiaireJeanPierreNoHyphen.id)
    })

    it('should NOT find Mueller/Müller as duplicates (different after unaccent)', async () => {
      const duplicates = await findDuplicateForBeneficiaire({
        beneficiaire: withBrandedFields(beneficiaireMueller),
        withConflictingFields: 'include',
        fuzzyMatching: false,
      })

      // "Mueller" and "Müller" (-> "Muller" after unaccent) are different
      // With only same prenom "Hans", they don't have 2 matching fields
      expect(duplicates).toHaveLength(0)
    })

    it('should find duplicates with same email and phone', async () => {
      const duplicates = await findDuplicateForBeneficiaire({
        beneficiaire: withBrandedFields(beneficiaireSameEmail1),
        withConflictingFields: 'include',
        fuzzyMatching: false,
      })

      expect(duplicates).toHaveLength(1)
      expect(duplicates[0].id).toBe(beneficiaireSameEmail2.id)
    })
  })

  describe('fuzzy matching (fuzzyMatching: true)', () => {
    it('should find Mueller/Müller as duplicates with fuzzy matching', async () => {
      const duplicates = await findDuplicateForBeneficiaire({
        beneficiaire: withBrandedFields(beneficiaireMueller),
        withConflictingFields: 'include',
        fuzzyMatching: true,
      })

      // With fuzzy matching, "Mueller" and "Muller" (from "Müller") should be similar enough
      // Combined with same prenom "Hans", they should have 2 matching fields
      expect(duplicates).toHaveLength(1)
      expect(duplicates[0].id).toBe(beneficiaireMuller.id)
    })

    it('should still find exact matches', async () => {
      const duplicates = await findDuplicateForBeneficiaire({
        beneficiaire: withBrandedFields(beneficiaireJeanPierre),
        withConflictingFields: 'include',
        fuzzyMatching: true,
      })

      expect(duplicates).toHaveLength(1)
      expect(duplicates[0].id).toBe(beneficiaireJeanPierreNoHyphen.id)
    })

    it('should still find duplicates with same email and phone', async () => {
      const duplicates = await findDuplicateForBeneficiaire({
        beneficiaire: withBrandedFields(beneficiaireSameEmail1),
        withConflictingFields: 'include',
        fuzzyMatching: true,
      })

      expect(duplicates).toHaveLength(1)
      expect(duplicates[0].id).toBe(beneficiaireSameEmail2.id)
    })
  })

  describe('withConflictingFields behavior', () => {
    it('should exclude conflicts when withConflictingFields is exclude', async () => {
      // beneficiaireSameEmail1 and beneficiaireSameEmail2 have same email+phone
      // but different nom and prenom, so they conflict
      const duplicates = await findDuplicateForBeneficiaire({
        beneficiaire: withBrandedFields(beneficiaireSameEmail1),
        withConflictingFields: 'exclude',
        fuzzyMatching: false,
      })

      // Should not find duplicates because nom and prenom conflict
      expect(duplicates).toHaveLength(0)
    })

    it('should include conflicts when withConflictingFields is include', async () => {
      const duplicates = await findDuplicateForBeneficiaire({
        beneficiaire: withBrandedFields(beneficiaireSameEmail1),
        withConflictingFields: 'include',
        fuzzyMatching: false,
      })

      // Should find duplicate despite conflicting nom and prenom
      expect(duplicates).toHaveLength(1)
      expect(duplicates[0].id).toBe(beneficiaireSameEmail2.id)
    })
  })
})
