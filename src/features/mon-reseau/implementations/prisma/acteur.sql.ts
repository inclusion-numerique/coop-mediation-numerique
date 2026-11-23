import { Prisma } from '@/generated/prisma/client'
import type { CodeDepartement, CodeInsee } from '@/libraries/insee'
import { departementCodeFromInseeRegex } from './departement-du-code-insee.sql'

export const ACTEUR = {
  id: Prisma.raw('u.id'),
  nom: Prisma.raw('u.last_name'),
  prenom: Prisma.raw('u.first_name'),
  courriel: Prisma.raw('u.email'),
  mediateur: Prisma.raw('m.id'),
  coordinateur: Prisma.raw('c.id'),
} as const

export const DEPUIS_LES_ACTEURS = Prisma.sql`
  FROM users u
  LEFT JOIN main.personne pe ON pe.coop_id = u.id
  LEFT JOIN coop.employeuse_actuelle ea ON ea.personne_id = pe.id
  LEFT JOIN mediateurs m ON m.user_id = u.id
  LEFT JOIN mediateurs_en_activite mea
    ON mea.mediateur_id = m.id AND mea.suppression IS NULL AND mea.fin_activite IS NULL
  LEFT JOIN lieu_inclusion s2 ON s2.id = mea.structure_id
  LEFT JOIN coordinateurs c ON c.user_id = u.id
`

export const ACTEUR_VISIBLE = Prisma.sql`(
  u.deleted IS NULL
  AND u.inscription_validee IS NOT NULL
  AND (m.id IS NOT NULL OR c.id IS NOT NULL)
)`

export const acteurDuDepartement = (code: CodeDepartement) => Prisma.sql`(
  SUBSTRING(ea.code_insee FROM ${departementCodeFromInseeRegex}) = ${code}
  OR SUBSTRING(s2.code_insee FROM ${departementCodeFromInseeRegex}) = ${code}
)`

export const acteurDesCommunes = (
  codesInsee: readonly CodeInsee[],
) => Prisma.sql`(
  ea.code_insee = ANY(${[...codesInsee]}::TEXT[])
  OR s2.code_insee = ANY(${[...codesInsee]}::TEXT[])
)`

export const acteurConseillerNumerique = (releve: boolean) =>
  Prisma.raw(`${releve ? '' : 'NOT '}EXISTS (
    SELECT 1
    FROM main.conseiller_numerique_en_poste cn
    JOIN main.personne p ON p.id = cn.personne_id
    WHERE p.coop_id = u.id
  )`)

export const acteurVisibleWhere = {
  deleted: null,
  inscriptionValidee: { not: null },
  OR: [{ mediateur: { isNot: null } }, { coordinateur: { isNot: null } }],
} satisfies Prisma.UserWhereInput
