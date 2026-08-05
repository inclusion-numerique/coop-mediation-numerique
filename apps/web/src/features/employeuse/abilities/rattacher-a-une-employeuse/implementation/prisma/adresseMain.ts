import { searchAdresse } from '@app/web/external-apis/apiAdresse'
import { banFeatureToAdresseBanData } from '@app/web/external-apis/ban/banFeatureToAdresseBanData'
import { prismaClient } from '@app/web/prismaClient'
import { CodeInsee } from '../../../../domain/code-insee'
import { CodePostal } from '../../../../domain/code-postal'

// Sous-ensemble d'adresse suffisant pour géocoder et persister une `main.adresse`. `SireneIdentity`
// (API Entreprise) en est un sur-ensemble, mais le chemin d'écriture au fil de l'eau fournit ces
// champs directement (payload Dataspace / saisie) sans passer par l'API — d'où ce type dédié.
export type AdresseSource = {
  adresse: string
  codePostal: string
  codeInsee: string
  commune: string
}

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

// `main.adresse.code_postal` et `code_insee` sont des `varchar(5)` NOT NULL, et aucune source amont
// ne garantit le format : pour un établissement non diffusible, l'API Recherche d'entreprises rend
// littéralement `[NON-DIFFUSIBLE]` dans `code_postal` — 16 caractères, INSERT en échec `22001`. Les
// value objects du domaine tranchent ici, au seul point où l'adresse entre en base : ce qui n'est
// pas un code valide devient `''`, la colonne restant renseignée. Le reste de l'adresse (commune,
// code INSEE) est juste dans ce cas et n'est pas perdu.
const codePostalAdressable = (value: string): string =>
  CodePostal.safe(value) ?? ''

const codeInseeAdressable = (value: string): string =>
  CodeInsee.safe(value) ?? ''

// La clé d'unicité de `main.adresse` ne porte PAS le code INSEE : deux adresses de même
// (code_postal, commune, voie) y sont la même ligne. On aligne la déduplication dessus.
export const adresseMainKey = ({
  codePostal,
  nomCommune,
  nomVoie,
}: ResolvedAdresseMain): string => `${codePostal}__${nomCommune}__${nomVoie}`

export const resolveAdresseMain = async (
  identity: AdresseSource,
): Promise<ResolvedAdresseMain> => {
  const feature = await searchAdresse(
    `${identity.adresse}, ${identity.codePostal} ${identity.commune}`,
  )
  const banScore = feature?.properties.score ?? null

  if (feature && feature.properties.score > BAN_SCORE_THRESHOLD) {
    const ban = banFeatureToAdresseBanData(feature)
    return {
      nomVoie: ban.nom,
      codePostal: codePostalAdressable(ban.codePostal),
      codeInsee: codeInseeAdressable(ban.codeInsee),
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
    codePostal: codePostalAdressable(identity.codePostal),
    codeInsee: codeInseeAdressable(identity.codeInsee),
    nomCommune: identity.commune,
    codeBan: null,
    longitude: null,
    latitude: null,
    banScore,
    source: 'api-entreprise',
  }
}

// Réutilise une adresse existante pour ne violer AUCUNE des deux contraintes d'unicité de
// `main.adresse` : la clé COMPOSANT `(code_postal, nom_commune, nom_voie, numero_voie, repetition)`
// ET `code_ban` (uuid). On cherche par les DEUX (OR) : un même lieu peut déjà exister en base
// (données Entrepôt) avec un `code_ban` différent ou absent — chercher seulement par `code_ban`
// manquait la ligne existante et l'INSERT violait la clé composant (bug révélé par l'e2e inscription
// CN : adresse ANCT "20 Avenue de Ségur" déjà présente).
export const findAdresseMainId = (resolved: ResolvedAdresseMain) =>
  prismaClient.adresseMain.findFirst({
    where: {
      OR: [
        {
          codePostal: resolved.codePostal,
          nomCommune: resolved.nomCommune,
          nomVoie: resolved.nomVoie,
          numeroVoie: null,
          repetition: null,
        },
        ...(resolved.codeBan ? [{ codeBan: resolved.codeBan }] : []),
      ],
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
