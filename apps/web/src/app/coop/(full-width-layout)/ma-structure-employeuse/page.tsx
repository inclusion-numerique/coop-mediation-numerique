import CoopBreadcrumbs from '@app/web/app/coop/CoopBreadcrumbs'
import { metadataTitle } from '@app/web/app/metadataTitle'
import { authenticateUser } from '@app/web/auth/authenticateUser'
import SkipLinksPortal from '@app/web/components/SkipLinksPortal'
import ActeurStructureEmployeuse from '@app/web/features/mon-reseau/use-cases/acteurs/components/ActeurStructureEmployeuse'
import {
  emploiStructureMainSelect,
  toEmploiStructureEmployeuse,
} from '@app/web/features/mon-reseau/use-cases/acteurs/db/getActeurEmploiForDate'
import { prismaClient } from '@app/web/prismaClient'
import { contentId } from '@app/web/utils/skipLinks'
import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import React from 'react'

export const metadata: Metadata = {
  title: metadataTitle('Ma structure employeuse'),
}

const MaStructureEmployeusePage = async () => {
  const user = await authenticateUser()

  if (!user.mediateur && !user.coordinateur) {
    return redirect('/')
  }

  const structuresEmployeuses = await prismaClient.employeStructure.findMany({
    where: {
      userId: user.id,
      suppression: null,
      OR: [
        {
          fin: null,
        },
        {
          fin: { gte: new Date() },
        },
      ],
    },
    orderBy: {
      debut: 'desc',
    },
    select: {
      id: true,
      userId: true,
      debut: true,
      fin: true,
      creation: true,
      structureId: true,
      structureMainId: true,
      structureMain: {
        select: emploiStructureMainSelect,
      },
    },
  })

  // Repointé vers main (ADR-002 étape 6) : structure normalisée via le mapper partagé.
  const rawEmploi = structuresEmployeuses.at(0)
  const emploi = rawEmploi
    ? {
        id: rawEmploi.id,
        userId: rawEmploi.userId,
        debut: rawEmploi.debut,
        fin: rawEmploi.fin,
        creation: rawEmploi.creation,
        structureId: rawEmploi.structureId,
        structureMainId: rawEmploi.structureMainId,
        structure: toEmploiStructureEmployeuse(rawEmploi.structureMain),
      }
    : undefined

  return (
    <>
      <SkipLinksPortal />
      <div className="fr-container fr-container--800">
        <CoopBreadcrumbs currentPage="Ma structure employeuse" />
        <main id={contentId} className="fr-mb-16w">
          <div className="fr-flex fr-flex-wrap fr-direction-row fr-align-items-center fr-flex-gap-4v fr-my-12v">
            <span
              className="ri-home-smile-2-line ri-xl fr-line-height-1 fr-text-label--blue-france fr-background-alt--blue-france fr-p-2w fr-m-0 fr-border-radius--8"
              aria-hidden
            />
            <h1 className="fr-page-title fr-m-0">Ma structure employeuse</h1>
          </div>

          {emploi ? (
            <ActeurStructureEmployeuse
              emploi={emploi}
              // La notice « employeuse = lieu d'activité » reposait sur l'égalité d'id employeuse/lieu,
              // morte depuis l'étape 1 (clé de corrélation). Désactivée ici (ADR-002).
              showIsLieuActiviteNotice={false}
              showReferentStructure={true}
              showReferentStructureConseillerNumeriqueSupportNotice={false}
              canUpdateStructure={user.isConseillerNumerique}
            />
          ) : (
            <div className="fr-text--center fr-background-alt--blue-france fr-border-radius--8 fr-p-6w">
              <h2 className="fr-h6 fr-mb-1v">
                Vous n’avez pas renseigné de structure employeuse
              </h2>
              <p className="fr-mb-0">
                Vous pouvez continuez à utiliser la plateforme, cependant vous
                ne serez plus identifié sur votre territoire comme faisant
                partie de la communauté de la médiation numérique
              </p>
            </div>
          )}
        </main>
      </div>
    </>
  )
}

export default MaStructureEmployeusePage
