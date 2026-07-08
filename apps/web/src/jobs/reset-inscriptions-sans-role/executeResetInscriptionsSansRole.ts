import { output } from '@app/web/jobs/output'
import { prismaClient } from '@app/web/prismaClient'
import { v4 } from 'uuid'
import type { ResetInscriptionsSansRoleJob } from './resetInscriptionsSansRoleJob'

/**
 * Réinitialise l’inscription des comptes « fantômes » : inscription validée
 * mais aucun profil de rôle (ni médiateur, ni coordinateur). Ces comptes ne
 * peuvent rien faire dans la coop et bouclent entre /coop et /connexion.
 *
 * Le reset reprend le périmètre de l’ancien bouton support « reset
 * inscription » : l’utilisateur reprend son parcours d’inscription à sa
 * prochaine connexion, ses emplois sont conservés.
 */
export const executeResetInscriptionsSansRole = async (
  job: ResetInscriptionsSansRoleJob,
) => {
  const dryRun = job.payload?.dryRun ?? true

  const comptes = await prismaClient.user.findMany({
    where: {
      role: 'User',
      deleted: null,
      inscriptionValidee: { not: null },
      mediateur: { is: null },
      coordinateur: { is: null },
    },
    select: {
      id: true,
      email: true,
      profilInscription: true,
      inscriptionValidee: true,
    },
    orderBy: { inscriptionValidee: 'asc' },
  })

  output.log(
    [
      `${comptes.length} comptes avec inscription validée sans profil de rôle`,
      ...comptes.map(
        ({ email, profilInscription, inscriptionValidee }) =>
          `- ${email} (profil ${profilInscription ?? 'inconnu'}, validée le ${inscriptionValidee?.toISOString().slice(0, 10)})`,
      ),
    ].join('\n'),
  )

  if (dryRun) {
    output.log(
      'Dry run : aucune modification (relancer avec {"dryRun": false})',
    )
    return { success: true, dryRun, total: comptes.length, reset: 0 }
  }

  await prismaClient.$transaction([
    prismaClient.user.updateMany({
      where: { id: { in: comptes.map(({ id }) => id) } },
      data: {
        inscriptionValidee: null,
        profilInscription: null,
        acceptationCgu: null,
        structureEmployeuseRenseignee: null,
        hasSeenOnboarding: null,
        donneesConseillerNumeriqueV1Importees: null,
      },
    }),
    prismaClient.mutation.createMany({
      data: comptes.map(({ id }) => ({
        id: v4(),
        userId: id,
        nom: 'ResetInscription' as const,
        duration: 0,
        data: { id, job: 'reset-inscriptions-sans-role' },
      })),
    }),
  ])

  output.log(`${comptes.length} inscriptions réinitialisées`)

  return { success: true, dryRun, total: comptes.length, reset: comptes.length }
}
