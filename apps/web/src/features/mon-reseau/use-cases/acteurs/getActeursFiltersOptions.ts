import type { SelectOption } from '@app/ui/components/Form/utils/options'
import type { LieuActiviteOption } from '@app/web/features/lieux-activite/getMediateursLieuxActiviteOptions'
import { departementCodeFromInseeRegex } from '@app/web/features/mon-reseau/departementCodeFromInseeRegex'
import { prismaClient } from '@app/web/prismaClient'
import { getDepartementsFromCodesInsee } from '@app/web/utils/getDepartementFromCodeInsee'

export const getActeursFiltersOptions = async ({
  departementCode,
  currentLieuxFilter = [],
}: {
  departementCode: string
  currentLieuxFilter?: string[] // UUIDs of currently filtered lieux
}) => {
  // Get communes from structures in the department
  const communes = await prismaClient.$queryRaw<
    {
      code: string
      commune: string
      code_postal: string
    }[]
  >`
    SELECT DISTINCT
      s.code_insee AS code,
      s.commune,
      s.code_postal
    FROM structures s
    WHERE s.suppression IS NULL
      AND SUBSTRING(s.code_insee FROM ${departementCodeFromInseeRegex}) = ${departementCode}
      AND s.code_insee IS NOT NULL
      AND s.commune IS NOT NULL
    ORDER BY s.commune ASC
  `

  const communesOptions: SelectOption[] = communes
    .filter(
      ({ code_postal, commune }) => !!code_postal?.trim() && !!commune?.trim(),
    ) // Filter out missing communes
    .map(({ code, code_postal, commune }) => ({
      value: code,
      label:
        !!commune && !!code_postal
          ? `${commune} · ${code_postal}`
          : `${commune}${code_postal}`,
    }))

  // Get departements from communes found
  const departementsOptions: SelectOption[] = getDepartementsFromCodesInsee(
    communes.map(({ code }) => code),
  ).map(({ code, nom }) => ({
    value: code,
    label: `${code} · ${nom}`,
  }))

  // Get lieux d'activité (structures) in the department
  const structures = await prismaClient.structure.findMany({
    where: {
      suppression: null,
      codeInsee: {
        startsWith: departementCode.length === 2 ? departementCode : undefined,
      },
    },
    select: {
      id: true,
      nom: true,
      adresse: true,
      codePostal: true,
      commune: true,
      activitesCount: true,
    },
    orderBy: [{ activitesCount: 'desc' }, { nom: 'asc' }],
    take: 100, // Limit for performance
  })

  // Filter structures that are actually in the department (handle DOM-TOM and Corsica)
  const filteredStructures = await prismaClient.$queryRaw<{ id: string }[]>`
    SELECT id FROM structures
    WHERE suppression IS NULL
      AND SUBSTRING(code_insee FROM ${departementCodeFromInseeRegex}) = ${departementCode}
    LIMIT 100
  `

  const structureIds = new Set(filteredStructures.map((s) => s.id))

  const lieuxActiviteOptions: LieuActiviteOption[] = structures
    .filter((s) => structureIds.has(s.id))
    .map(
      ({ id, nom, commune, codePostal, adresse, activitesCount }, index) => ({
        value: id,
        label: nom,
        extra: {
          nom,
          adresse:
            `${adresse ?? ''}, ${codePostal ?? ''} ${commune ?? ''}`.trim(),
          activites: activitesCount,
          mostUsed: index === 0 && activitesCount > 0,
        },
      }),
    )

  // If there are filtered lieux that are not in the options, fetch them separately
  // This ensures tags can be displayed for structures not in the top 100
  const existingLieuxIds = new Set(lieuxActiviteOptions.map((l) => l.value))
  const missingLieuxIds = currentLieuxFilter.filter(
    (id) => !existingLieuxIds.has(id),
  )

  if (missingLieuxIds.length > 0) {
    const missingStructures = await prismaClient.structure.findMany({
      where: {
        id: { in: missingLieuxIds },
        suppression: null,
      },
      select: {
        id: true,
        nom: true,
        adresse: true,
        codePostal: true,
        commune: true,
        activitesCount: true,
      },
    })

    const missingOptions: LieuActiviteOption[] = missingStructures.map(
      ({ id, nom, commune, codePostal, adresse, activitesCount }) => ({
        value: id,
        label: nom,
        extra: {
          nom,
          adresse:
            `${adresse ?? ''}, ${codePostal ?? ''} ${commune ?? ''}`.trim(),
          activites: activitesCount,
          mostUsed: false,
        },
      }),
    )

    lieuxActiviteOptions.push(...missingOptions)
  }

  return {
    communesOptions,
    departementsOptions,
    lieuxActiviteOptions,
  }
}
