import type { Prisma } from '@prisma/client'
import type { Lieu } from '../../../domain/lieu'

/**
 * L'adresse du lieu dans `main.adresse`, résolue par la fonction de l'Entrepôt.
 *
 * `main.trouver_ou_creer_adresse_lieu` est fournie par l'équipe qui possède le
 * schéma. L'employer plutôt que de refaire son travail n'est pas une commodité :
 * c'est la seule façon d'écrire les adresses sous la MÊME forme qu'eux.
 *
 * Leur pipeline découpe la ligne de voie — numéro d'un côté, `bis`/`ter` de
 * l'autre, voie en capitales initiales — là où la coop la garde entière. Sur les
 * 44 354 adresses de la table, 29 088 sont rangées à leur façon contre 768 à la
 * nôtre : une adresse qu'ils connaissaient déjà, notre recherche par clé unique
 * ne la trouvait pas, et nous en insérions un doublon. La table est mutualisée —
 * 2 557 lignes servent plusieurs lieux, 3 022 servent un lieu et une structure
 * administrative — donc ces doublons se propagent.
 *
 * Elle apporte deux choses de plus que notre implémentation : la reprise après
 * une course perdue (`ON CONFLICT DO NOTHING` puis nouvelle lecture), et le
 * `SECURITY DEFINER` qui affranchit la coop des droits sur `main.adresse`.
 *
 * On ne modifie toujours JAMAIS une adresse en place — la fonction ne fait que
 * chercher ou créer, et c'est `adresse_id` qu'on repointe.
 */

/**
 * `code_postal` et `code_insee` sont des `varchar(5)` NOT NULL, et la fonction
 * refuse un code INSEE vide par une exception — qui avorterait la transaction
 * entière, donc l'enregistrement du médiateur. On ne l'appelle qu'avec de quoi
 * répondre. Aucun lieu vivant n'est aujourd'hui dans ce cas.
 */
const codeAdressable = (valeur: string | null | undefined): string | null =>
  valeur != null && /^\w{5}$/.test(valeur) ? valeur : null

/**
 * L'identifiant de la `main.adresse` où pointer le lieu, en la créant au besoin.
 * `null` quand le lieu n'a pas d'adresse exploitable — 133 lieux actifs sont
 * dans ce cas, et la colonne du registre est nullable pour eux.
 */
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
