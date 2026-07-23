import { searchAdresse } from '@app/web/external-apis/apiAdresse'
import { banFeatureToAdresseBanData } from '@app/web/external-apis/ban/banFeatureToAdresseBanData'
import type { SireneIdentity } from '@app/web/features/structures/siret/siretIdentity'
import { prismaClient } from '@app/web/prismaClient'

// Résolution et persistance d'une `main.adresse` à partir d'une identité SIRENE, partagées entre le
// job de complétion/couverture et le chemin d'écriture (ADR-002). L'adresse de l'API Entreprise est
// géocodée via la BAN : au-dessus du seuil on garde le résultat BAN (structuré + `code_ban` +
// coordonnées `geom`), sinon on garde l'adresse de l'API Entreprise.

// Au-dessus de ce score, on considère que la BAN a trouvé la bonne adresse et on l'utilise.
export const BAN_SCORE_THRESHOLD = 0.9

export type ResolvedAdresseMain = {
  nomVoie: string
  codePostal: string
  codeInsee: string
  nomCommune: string
  codeBan: string | null
  longitude: number | null
  latitude: number | null
  banScore: number | null
  source: 'ban' | 'api-entreprise'
}

// La clé d'unicité de `main.adresse` ne porte PAS le code INSEE : deux adresses de même
// (code_postal, commune, voie) y sont la même ligne. On aligne la déduplication dessus.
export const adresseMainKey = ({
  codePostal,
  nomCommune,
  nomVoie,
}: ResolvedAdresseMain): string => `${codePostal}__${nomCommune}__${nomVoie}`

export const resolveAdresseMain = async (
  identity: SireneIdentity,
): Promise<ResolvedAdresseMain> => {
  const feature = await searchAdresse(
    `${identity.adresse}, ${identity.codePostal} ${identity.commune}`,
  )
  const banScore = feature?.properties.score ?? null

  if (feature && feature.properties.score > BAN_SCORE_THRESHOLD) {
    const ban = banFeatureToAdresseBanData(feature)
    return {
      nomVoie: ban.nom,
      codePostal: ban.codePostal,
      codeInsee: ban.codeInsee,
      nomCommune: ban.commune,
      // `main.adresse.code_ban` est un `uuid` : on prend le `banId` (uuid), PAS `ban.id` (clé
      // "codeInsee_voie_numero"), sinon le cast `::uuid` de l'INSERT échoue.
      codeBan: feature.properties.banId ?? null,
      longitude: ban.longitude,
      latitude: ban.latitude,
      banScore,
      source: 'ban',
    }
  }

  return {
    nomVoie: identity.adresse,
    codePostal: identity.codePostal,
    codeInsee: identity.codeInsee,
    nomCommune: identity.commune,
    codeBan: null,
    longitude: null,
    latitude: null,
    banScore,
    source: 'api-entreprise',
  }
}

// Réutilise une adresse existante : par `code_ban` (uuid unique) quand la BAN en a fourni un — sinon
// l'INSERT violerait la contrainte d'unicité si l'adresse est déjà en base (données Dataspace) —,
// sinon par la clé (code_postal, commune, voie).
export const findAdresseMainId = (resolved: ResolvedAdresseMain) =>
  prismaClient.adresseMain.findFirst({
    where: resolved.codeBan
      ? { codeBan: resolved.codeBan }
      : {
          codePostal: resolved.codePostal,
          nomCommune: resolved.nomCommune,
          nomVoie: resolved.nomVoie,
          numeroVoie: null,
          repetition: null,
        },
    select: { id: true },
  })

// Crée une `main.adresse` en SQL brut : `geom` (postgis) n'est pas écrivable par le client typé.
// `ST_MakePoint` reçoit des `NULL` quand la BAN n'a pas tranché -> `geom` NULL (adresse API).
export const insertAdresseMain = async (
  resolved: ResolvedAdresseMain,
): Promise<number> => {
  const [created] = await prismaClient.$queryRaw<{ id: number }[]>`
    INSERT INTO main.adresse (code_postal, code_insee, nom_commune, nom_voie, code_ban, geom)
    VALUES (
      ${resolved.codePostal}, ${resolved.codeInsee}, ${resolved.nomCommune}, ${resolved.nomVoie},
      ${resolved.codeBan}::uuid,
      ST_SetSRID(ST_MakePoint(${resolved.longitude}::float8, ${resolved.latitude}::float8), 4326)
    )
    RETURNING id`
  return created.id
}
