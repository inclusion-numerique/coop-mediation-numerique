import { AnalysisSchema } from '@app/web/beneficiaire/import/analyseImportBeneficiairesExcel'
import { searchBeneficiaire } from '@app/web/beneficiaire/searchBeneficiaire'
import { trancheAgeFromAnneeNaissance } from '@app/web/beneficiaire/trancheAgeFromAnneeNaissance'
import {
  BeneficiaireData,
  BeneficiaireValidation,
} from '@app/web/features/beneficiaires/validation/BeneficiaireValidation'
import { prismaClient } from '@app/web/prismaClient'
import { protectedProcedure, router } from '@app/web/server/rpc/createRouter'
import { enforceIsMediateur } from '@app/web/server/rpc/enforceIsMediateur'
import { forbiddenError, invalidError } from '@app/web/server/rpc/trpcErrors'
import { addMutationLog } from '@app/web/utils/addMutationLog'
import { createStopwatch } from '@app/web/utils/stopwatch'
import type { Prisma } from '@prisma/client'
import { v4 } from 'uuid'
import { z } from 'zod'

const checkExistingBeneficiaire = async ({
  beneficiaireId,
  mediateurId,
}: {
  beneficiaireId: string | null | undefined
  mediateurId: string
}) => {
  if (!beneficiaireId) {
    return null
  }
  const existingBeneficiaire = await prismaClient.beneficiaire.findUnique({
    where: {
      id: beneficiaireId,
      suppression: null,
    },
  })
  // Enforce that the beneficiaire is created by the current mediateur
  if (!existingBeneficiaire) {
    throw invalidError('Beneficiaire not found')
  }
  if (existingBeneficiaire.mediateurId !== mediateurId) {
    throw invalidError('Beneficiaire not created by current mediateur')
  }

  return existingBeneficiaire
}

const beneficiaireCreateInputFromForm = ({
  mediateurId,
  prenom,
  nom,
  telephone,
  email,
  anneeNaissance,
  adresse,
  communeResidence,
  genre,
  trancheAge,
  statutSocial,
  notes,
}: BeneficiaireData): Prisma.BeneficiaireCreateInput => ({
  mediateur: {
    connect: { id: mediateurId },
  },
  prenom,
  nom,
  telephone: telephone || null,
  email: email || null,
  anneeNaissance: anneeNaissance || null,
  adresse: adresse ?? null,
  genre: genre ?? null,
  trancheAge: trancheAge ?? null,
  statutSocial: statutSocial ?? null,
  notes: notes ?? null,
  commune: communeResidence?.nom ?? null,
  communeCodePostal: communeResidence?.codePostal ?? null,
  communeCodeInsee: communeResidence?.codeInsee ?? null,
})

export const beneficiairesRouter = router({
  search: protectedProcedure
    .input(
      z.object({
        query: z.string(),
        excludeIds: z.array(z.string()).default([]),
      }),
    )
    .query(({ input: { query, excludeIds }, ctx: { user } }) => {
      if (!user.mediateur && user.role !== 'Admin') {
        throw forbiddenError('User is not a mediateur')
      }
      return searchBeneficiaire({
        mediateurId: user.mediateur?.id,
        searchParams: {
          recherche: query,
        },
        excludeIds,
      })
    }),
  createOrUpdate: protectedProcedure
    .input(BeneficiaireValidation)
    .mutation(async ({ input, ctx: { user } }) => {
      enforceIsMediateur(user)

      const { id, mediateurId } = input

      const stopwatch = createStopwatch()

      // Enforce user can create CRA for given mediateurId (for now only self)
      if (mediateurId !== user.mediateur.id) {
        throw forbiddenError('Cannot beneficiary for another mediateur')
      }

      await checkExistingBeneficiaire({
        beneficiaireId: id,
        mediateurId,
      })

      const data = beneficiaireCreateInputFromForm(input)

      if (id) {
        const updated = await prismaClient.beneficiaire.update({
          where: { id },
          data,
        })

        addMutationLog({
          userId: user.id,
          nom: 'ModifierBeneficiaire',
          duration: stopwatch.stop().duration,
          data: input,
        })

        return updated
      }

      const newId = v4()
      const created = await prismaClient.beneficiaire.create({
        data: {
          ...data,
          id: newId,
          mediateur: {
            connect: { id: mediateurId },
          },
        },
      })

      addMutationLog({
        userId: user.id,
        nom: 'CreerBeneficiaire',
        duration: stopwatch.stop().duration,
        data: input,
      })

      return created
    }),
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx: { user } }) => {
      enforceIsMediateur(user)

      const { id } = input

      const stopwatch = createStopwatch()

      const beneficiaire = await checkExistingBeneficiaire({
        beneficiaireId: id,
        mediateurId: user.mediateur.id,
      })

      if (!beneficiaire) {
        throw invalidError('Beneficiaire not found')
      }

      await prismaClient.beneficiaire.update({
        where: { id },
        data: {
          anonyme: true,
          suppression: new Date(),
          modification: new Date(),
          // Anonymize the beneficiaire but keep anonymous data for stats
          prenom: null,
          nom: null,
          telephone: null,
          email: null,
          notes: null,
          adresse: null,
          pasDeTelephone: null,
        },
      })

      addMutationLog({
        userId: user.id,
        nom: 'SupprimerBeneficiaire',
        duration: stopwatch.stop().duration,
        data: {
          id,
        },
      })

      return true
    }),
  import: protectedProcedure
    .input(AnalysisSchema)
    .mutation(async ({ input: analysis, ctx: { user } }) => {
      enforceIsMediateur(user)

      const stopwatch = createStopwatch()

      const { rows, status } = analysis

      const imported = new Date()

      const beneficiairesData = rows
        .map(
          (row): Prisma.BeneficiaireCreateManyInput => ({
            prenom: row.values.prenom ?? '',
            nom: row.values.nom ?? '',
            anneeNaissance: row.parsed.anneeNaissance || undefined,
            trancheAge:
              trancheAgeFromAnneeNaissance(row.parsed.anneeNaissance) ||
              undefined,
            telephone: row.values.numeroTelephone || undefined,
            email: row.values.email,
            genre: row.parsed.genre,
            notes: row.values.notesSupplementaires,
            mediateurId: user.mediateur.id,
            communeCodeInsee: row.parsed.commune?.codeInsee,
            commune: row.parsed.commune?.nom,
            communeCodePostal: row.parsed.commune?.codePostal,
            import: imported,
          }),
        )
        .filter(({ prenom, nom }) => prenom && nom)

      const created = await prismaClient.beneficiaire.createMany({
        data: beneficiairesData,
      })

      addMutationLog({
        userId: user.id,
        nom: 'ImporterBeneficiaires',
        duration: stopwatch.stop().duration,
        data: {
          rows: rows.length,
          rowsErrorsCount: rows.filter((row) => !!row.errors).length,
          status,
        },
      })

      return { created: created.count }
    }),
})
