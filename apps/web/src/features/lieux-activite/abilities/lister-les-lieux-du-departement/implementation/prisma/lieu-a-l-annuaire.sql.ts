import { Prisma } from '@app/web/generated/prisma/client'
import { departementCodeFromInseeRegex } from '@app/web/utils/departementCodeFromInseeRegex'

export const lieuALAnnuaireDuDepartement = (
  departementCode: string,
) => Prisma.sql`(
  s.suppression IS NULL
  AND SUBSTRING(s.code_insee FROM ${departementCodeFromInseeRegex}) = ${departementCode}
  AND (
    s.visible_pour_cartographie_nationale = true
    OR EXISTS (
      SELECT 1
      FROM mediateurs_en_activite mea2
      WHERE mea2.structure_id = s.id
        AND mea2.suppression IS NULL
        AND mea2.fin_activite IS NULL
    )
  )
)`
