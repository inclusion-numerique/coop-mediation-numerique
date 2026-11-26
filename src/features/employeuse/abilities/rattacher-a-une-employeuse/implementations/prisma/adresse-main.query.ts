import { prismaClient } from '@/configuration/prisma'
import type { Feature } from '@/libraries/ban'
import { banFeatureToAdresseBanData } from '@/libraries/ban'
import { CodePostal } from '@/libraries/code-postal'
import { CodeInsee } from '@/libraries/insee'

export type AdresseSource = {
  adresse: string
  codePostal: string
  codeInsee: string
  commune: string
}

const BAN_SCORE_THRESHOLD = 0.9

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

const codePostalAdressable = (value: string): string =>
  CodePostal.safe(value) ?? ''

const codeInseeAdressable = (value: string): string =>
  CodeInsee.safe(value) ?? ''

export const requeteDeGeocodage = ({
  adresse,
  codePostal,
  commune,
}: AdresseSource): string => `${adresse}, ${codePostal} ${commune}`

export const adresseMainDepuis = (
  identity: AdresseSource,
  feature: Feature | null,
): ResolvedAdresseMain => {
  const banScore = feature?.properties.score ?? null

  if (feature && feature.properties.score > BAN_SCORE_THRESHOLD) {
    const ban = banFeatureToAdresseBanData(feature)
    return {
      nomVoie: ban.nom,
      codePostal: codePostalAdressable(ban.codePostal),
      codeInsee: codeInseeAdressable(ban.codeInsee),
      nomCommune: ban.commune,
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

export const idDeLAdresseMain = (resolved: ResolvedAdresseMain) =>
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

export const insertAdresseMain = async (
  resolved: ResolvedAdresseMain,
): Promise<number> => {
  const [created] = await prismaClient.$queryRaw<[{ id: number }]>`
    INSERT INTO main.adresse (code_postal, code_insee, nom_commune, nom_voie, code_ban, geom)
    VALUES (
      ${resolved.codePostal}, ${resolved.codeInsee}, ${resolved.nomCommune}, ${resolved.nomVoie},
      ${resolved.codeBan}::uuid,
      ST_SetSRID(ST_MakePoint(${resolved.longitude}::float8, ${resolved.latitude}::float8), 4326)
    )
    RETURNING id`
  return created.id
}
