import type { SelectOption } from '@app/ui/components/Form/utils/options'
import type { LieuActiviteOption } from '@app/web/features/lieux-activite/getMediateursLieuxActiviteOptions'
import { prismaClient } from '@app/web/prismaClient'
import { getDepartementsFromCodesInsee } from '@app/web/utils/getDepartementFromCodeInsee'
import { Prisma } from '@prisma/client'

/**
 * Regex pattern for extracting department code from INSEE code
 * - 97x or 98x → DOM-TOM (3 digits)
 * - 2A / 2B → Corsica
 * - 00-95 → Metropolitan France
 */
const departementCodeFromInseeRegex = Prisma.raw(
  "'^(97[0-9]|98[0-9]|[0-9]{2}|2[AB])'",
)

export const getActeursFiltersOptions = async ({
  departementCode,
}: {
  departementCode: string
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

  const communesOptions: SelectOption[] = communes.map(
    ({ code, code_postal, commune }) => ({
      value: code,
      label: `${commune} · ${code_postal}`,
    }),
  )

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

  return {
    communesOptions,
    departementsOptions,
    lieuxActiviteOptions,
  }
}
