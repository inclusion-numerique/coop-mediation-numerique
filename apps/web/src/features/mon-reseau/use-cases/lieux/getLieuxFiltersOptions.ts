import type { SelectOption } from '@app/ui/components/Form/utils/options'
import { departementCodeFromInseeRegex } from '@app/web/features/mon-reseau/departementCodeFromInseeRegex'
import type { MediateurOption } from '@app/web/mediateurs/MediateurOption'
import { prismaClient } from '@app/web/prismaClient'

export const getLieuxFiltersOptions = async ({
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

  // Get mediateurs who have structures in the department
  const mediateurs = await prismaClient.$queryRaw<
    {
      mediateur_id: string
      first_name: string | null
      last_name: string | null
      name: string | null
      email: string
    }[]
  >`
    SELECT DISTINCT
      m.id AS mediateur_id,
      u.first_name,
      u.last_name,
      u.name,
      u.email
    FROM mediateurs m
    INNER JOIN users u ON u.id = m.user_id
    INNER JOIN mediateurs_en_activite mea ON mea.mediateur_id = m.id AND mea.suppression IS NULL AND mea.fin_activite IS NULL
    INNER JOIN structures s ON s.id = mea.structure_id AND s.suppression IS NULL
    WHERE u.deleted IS NULL
      AND SUBSTRING(s.code_insee FROM ${departementCodeFromInseeRegex}) = ${departementCode}
    ORDER BY u.last_name ASC, u.first_name ASC
  `

  const mediateursOptions: MediateurOption[] = mediateurs.map(
    ({ mediateur_id, first_name, last_name, name, email }) => {
      const displayName =
        first_name && last_name ? `${first_name} ${last_name}` : (name ?? '')
      return {
        label: displayName,
        value: { mediateurId: mediateur_id, email },
      }
    },
  )

  return {
    communesOptions,
    mediateursOptions,
  }
}
