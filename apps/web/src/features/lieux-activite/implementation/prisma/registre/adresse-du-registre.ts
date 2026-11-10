import type { Prisma } from '@app/web/generated/prisma/client'
import type { Lieu } from '../../../domain/lieu'

const codeAdressable = (valeur: string | null | undefined): string | null =>
  valeur != null && /^\w{5}$/.test(valeur) ? valeur : null

export const adresseDuRegistre = async (
  transaction: Prisma.TransactionClient,
  lieu: Lieu,
): Promise<number | null> => {
  const { adresse, localisation } = lieu.fiche

  if (adresse == null) return null

  const codePostal = codeAdressable(adresse.code_postal)
  const codeInsee = codeAdressable(adresse.code_insee)

  if (codePostal == null || codeInsee == null) return null

  const [resolue] = await transaction.$queryRaw<{ id: number | null }[]>`
    SELECT main.trouver_ou_creer_adresse_lieu(
      ${adresse.voie}::text,
      ${codePostal}::text,
      ${adresse.commune}::text,
      ${codeInsee}::text,
      ${localisation?.latitude ?? null}::float8,
      ${localisation?.longitude ?? null}::float8,
      -- banId est la clef d'interoperabilite BAN (75111_0272_00102), que la
      -- fonction cherche dans clef_interop — surtout pas code_ban, qui est un
      -- uuid. (Sans accents graves : ce SQL vit dans un template literal.)
      ${lieu.banId}::text
    ) AS id`

  return resolue?.id ?? null
}
