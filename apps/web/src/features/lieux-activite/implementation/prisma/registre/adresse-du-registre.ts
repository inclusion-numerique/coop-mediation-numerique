import type { Prisma } from '@prisma/client'
import type { Lieu } from '../../../domain/lieu'

/**
 * `main.adresse` est mutualisée : 2 557 de ses lignes servent plusieurs lieux et
 * 3 022 servent à la fois un lieu et une structure administrative. On ne la
 * modifie donc JAMAIS en place — corriger l'adresse d'un lieu déplacerait celle
 * des autres. Quand l'adresse d'un lieu change, on résout la nouvelle et on
 * repointe `adresse_id`, en laissant l'ancienne à ceux qui s'en servent encore.
 *
 * Deux contraintes d'unicité veillent, dont une que Prisma ne sait pas
 * modéliser : `adresse_ukey` sur
 * `(code_postal, nom_commune, nom_voie, COALESCE(numero_voie, 0), COALESCE(repetition, ''))`
 * en `NULLS NOT DISTINCT`, et `adresse_code_ban_ukey` sur l'uuid. D'où une
 * recherche avant toute insertion — le même écueil que côté employeuse, où
 * insérer sans chercher faisait échouer l'inscription sur une adresse déjà
 * connue de l'Entrepôt.
 */

/**
 * `code_postal` et `code_insee` sont des `varchar(5)` NOT NULL. La coop les
 * porte déjà validés — l'adresse du standard ne se construit pas sans code
 * postal — mais rien ne garantit le code INSEE, absent sur une partie du parc.
 * Ce qui n'est pas un code à cinq caractères devient `''` : la colonne reste
 * renseignée et le reste de l'adresse n'est pas perdu pour autant.
 */
const codeAdressable = (valeur: string | null | undefined): string =>
  valeur != null && /^\w{5}$/.test(valeur) ? valeur : ''

/**
 * La coop range toute la ligne de voie dans un champ unique (« 12 rue des
 * Lilas ») là où `main.adresse` sépare numéro, répétition et nom de voie. On
 * écrit donc la ligne entière dans `nom_voie`, comme le fait déjà l'écriture
 * employeuse : découper à la main fabriquerait des adresses fausses, et la
 * correspondance par `clef_interop` rattrape le cas courant.
 */
type AdresseARésoudre = {
  readonly nomVoie: string
  readonly codePostal: string
  readonly codeInsee: string
  readonly nomCommune: string
  readonly clefInterop: string | null
  readonly latitude: number | null
  readonly longitude: number | null
}

const aResoudre = (lieu: Lieu): AdresseARésoudre | null => {
  const { adresse, localisation } = lieu.fiche

  if (adresse == null) return null

  return {
    nomVoie: adresse.voie,
    codePostal: codeAdressable(adresse.code_postal),
    codeInsee: codeAdressable(adresse.code_insee),
    nomCommune: adresse.commune,
    // `banId` est l'identifiant de VOIE de la BAN (`80144_0018_00090`), pas
    // l'uuid : sa colonne dans l'Entrepôt est `clef_interop`, et surtout pas
    // `code_ban`, dont le cast `::uuid` échouerait.
    clefInterop: lieu.banId,
    latitude: localisation?.latitude ?? null,
    longitude: localisation?.longitude ?? null,
  }
}

/**
 * La ligne que `adresse_ukey` considère comme étant la nôtre — celle dont une
 * seconde interdirait l'insertion. La contrainte compare
 * `COALESCE(numero_voie, 0)` et `COALESCE(repetition, '')`, si bien que
 * chercher en `IS NULL` la manquerait : 13 118 lignes portent une répétition
 * vide plutôt que nulle, et quatre un numéro à zéro. On les manquerait, puis
 * l'insertion échouerait en plein enregistrement du médiateur.
 *
 * D'où le SQL brut : Prisma ne sait exprimer ni cette contrainte ni son index à
 * expression. Calquer le prédicat dessus le rend au passage indexé — 0,05 ms au
 * lieu des 3,3 ms d'un balayage de la table entière.
 */
const trouverParCleUnique = async (
  transaction: Prisma.TransactionClient,
  { codePostal, nomCommune, nomVoie }: AdresseARésoudre,
): Promise<number | null> => {
  const [trouvee] = await transaction.$queryRaw<{ id: number }[]>`
    SELECT id FROM main.adresse
    WHERE code_postal = ${codePostal}
      AND nom_commune = ${nomCommune}
      AND nom_voie = ${nomVoie}
      AND COALESCE(numero_voie::integer, 0) = 0
      AND COALESCE(repetition, '') = ''
    LIMIT 1`

  return trouvee?.id ?? null
}

/**
 * À défaut, la voie que la coop avait retenue au géocodage. C'est une
 * correspondance moins stricte mais plus fidèle : l'Entrepôt range souvent la
 * même adresse découpée (numéro à part), là où la coop garde la ligne entière —
 * la clé unique ne les rapproche donc pas, alors que la `clef_interop` les
 * désigne toutes deux. 11 572 lieux de la coop y trouvent leur adresse.
 *
 * Elle n'est pas unique en base, d'où le `findFirst` : les lignes qui la
 * partagent décrivent la même voie.
 */
const trouverParClefInterop = async (
  transaction: Prisma.TransactionClient,
  { clefInterop }: AdresseARésoudre,
): Promise<number | null> => {
  if (clefInterop == null) return null

  const trouvee = await transaction.adresseMain.findFirst({
    where: { clefInterop },
    select: { id: true },
    orderBy: { id: 'asc' },
  })

  return trouvee?.id ?? null
}

/**
 * Insère en SQL brut : `geom` est une colonne postgis, que le client typé ne
 * sait ni lire ni écrire. `ST_MakePoint` reçoit des `NULL` quand le lieu n'a pas
 * de coordonnées — `geom` reste alors nulle, ce que la colonne accepte.
 */
const inserer = async (
  transaction: Prisma.TransactionClient,
  adresse: AdresseARésoudre,
): Promise<number> => {
  const [creee] = await transaction.$queryRaw<{ id: number }[]>`
    INSERT INTO main.adresse (code_postal, code_insee, nom_commune, nom_voie, clef_interop, geom)
    VALUES (
      ${adresse.codePostal}, ${adresse.codeInsee}, ${adresse.nomCommune}, ${adresse.nomVoie},
      ${adresse.clefInterop},
      ST_SetSRID(ST_MakePoint(${adresse.longitude}::float8, ${adresse.latitude}::float8), 4326)
    )
    RETURNING id`

  return creee.id
}

/**
 * L'identifiant de la `main.adresse` où pointer le lieu, en la créant au besoin.
 * `null` quand le lieu n'a pas d'adresse valide — 133 lieux actifs sont dans ce
 * cas, et la colonne du registre est nullable pour eux.
 */
export const adresseDuRegistre = async (
  transaction: Prisma.TransactionClient,
  lieu: Lieu,
): Promise<number | null> => {
  const adresse = aResoudre(lieu)

  if (adresse == null) return null

  // La clé unique passe en premier : c'est elle qui décide si une insertion est
  // seulement possible. La `clef_interop` ne vient qu'ensuite, pour mieux
  // réutiliser lorsque l'insertion, elle, serait passée.
  const parCleUnique = await trouverParCleUnique(transaction, adresse)

  if (parCleUnique != null) return parCleUnique

  const parClefInterop = await trouverParClefInterop(transaction, adresse)

  return parClefInterop ?? (await inserer(transaction, adresse))
}
