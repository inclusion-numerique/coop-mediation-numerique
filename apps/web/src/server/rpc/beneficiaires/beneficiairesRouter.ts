import { AnalysisSchema } from '@app/web/beneficiaire/import/analyseImportBeneficiairesExcel'
import { trancheAgeFromAnneeNaissance } from '@app/web/beneficiaire/trancheAgeFromAnneeNaissance'
import { prismaClient } from '@app/web/prismaClient'
import { protectedProcedure, router } from '@app/web/server/rpc/createRouter'
import { enforceIsMediateur } from '@app/web/server/rpc/enforceIsMediateur'
import { addMutationLog } from '@app/web/utils/addMutationLog'
import { createStopwatch } from '@app/web/utils/stopwatch'
import type { Prisma } from '@prisma/client'

export const beneficiairesRouter = router({
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
