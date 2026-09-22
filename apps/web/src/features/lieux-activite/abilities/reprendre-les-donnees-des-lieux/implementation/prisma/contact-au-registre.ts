import {
  inscriptionPourLIdentifiantCarto,
  lieuCoopToDomain,
  lieuVersRegistre,
} from '@app/web/features/lieux-activite/implementation'
import type { Prisma } from '@prisma/client'

type ContactDuRegistre = ReturnType<typeof lieuVersRegistre>['contact']

export type ChampDuContact = keyof ContactDuRegistre

const enJson = (valeur: ContactDuRegistre[ChampDuContact]): string | null =>
  valeur === undefined ? null : JSON.stringify(valeur)

export const ecrireAuContactDuRegistre = async (
  transaction: Prisma.TransactionClient,
  lieuId: string,
  champ: ChampDuContact,
): Promise<void> => {
  const ligne = await transaction.lieuInclusion.findUnique({
    where: { id: lieuId },
    include: { inscriptionRegistre: inscriptionPourLIdentifiantCarto },
  })

  if (ligne == null) return

  const valeur = enJson(
    lieuVersRegistre(lieuCoopToDomain(ligne)).contact[champ],
  )

  await transaction.$executeRaw`
    UPDATE main.lieu_inclusion
    SET contact = CASE
      WHEN ${valeur}::text IS NULL
      THEN COALESCE(contact, '{}'::jsonb) - ${champ}::text
      ELSE COALESCE(contact, '{}'::jsonb) || jsonb_build_object(${champ}::text, ${valeur}::jsonb)
    END
    WHERE structure_coop_id = ${lieuId}::uuid
  `
}
