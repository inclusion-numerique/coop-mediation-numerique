import {
  personneEmployeuseSelect,
  resolveEmployeuseActuelle,
} from '@app/web/features/structures/main/affectationEmploiMain'
import { output } from '@app/web/jobs/output'
import { prismaClient } from '@app/web/prismaClient'
import { UpdateLieuxActivitesAdistanceJob } from './updateLieuxActivitesAdistanceJob'

export const executeUpdateLieuxActivitesADistance = async (
  _job: UpdateLieuxActivitesAdistanceJob,
) => {
  // Employeuse lue en PUR MAIN (ADR-002 échange final) : plus de `coop.employes_structures`.
  // On lit `personneMain` du médiateur et on dérive l'employeuse courante (commune/CP/insee).
  const activitesToUpdate = await prismaClient.activite.findMany({
    where: {
      typeLieu: 'ADistance',
      lieuCodeInsee: null,
    },
    include: {
      mediateur: {
        include: {
          user: {
            select: {
              personneMain: { select: personneEmployeuseSelect },
            },
          },
        },
      },
    },
  })

  output.log(`Found ${activitesToUpdate.length} activites to update`)

  for (const activite of activitesToUpdate) {
    const structureEmployeuse = resolveEmployeuseActuelle(
      activite.mediateur?.user?.personneMain ?? null,
    )

    if (!structureEmployeuse) {
      output.log(
        `No structure employeuse found for activite ${activite.id} and mediateur ${activite.mediateur?.id}`,
      )
      continue
    }

    await prismaClient.activite.update({
      where: {
        id: activite.id,
      },
      data: {
        lieuCodePostal: structureEmployeuse.codePostal,
        lieuCommune: structureEmployeuse.commune,
        lieuCodeInsee: structureEmployeuse.codeInsee,
      },
    })
  }

  return {
    success: true,
  }
}
