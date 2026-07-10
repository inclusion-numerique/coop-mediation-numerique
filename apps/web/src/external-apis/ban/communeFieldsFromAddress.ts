import { searchAdresse } from '@app/web/external-apis/apiAdresse'
import { banFeatureToAdresseBanData } from '@app/web/external-apis/ban/banFeatureToAdresseBanData'

export type CommuneFields = {
  commune: string
  communeCodePostal: string
  communeCodeInsee: string
}

export type ScoredCommuneFields = CommuneFields & { score: number }

// Géocode une adresse texte libre en commune complète (commune + code postal +
// code INSEE) ET expose le score de correspondance BAN (0–1), pour arbitrer un
// remplissage sous seuil de confiance. `null` si la BAN ne rend pas les 3 champs.
export const scoredCommuneFieldsFromAddress = async (
  address: string | null | undefined,
): Promise<ScoredCommuneFields | null> => {
  if (!address) return null

  const feature = await searchAdresse(address)
  if (!feature) return null

  const { commune, codePostal, codeInsee } = banFeatureToAdresseBanData(feature)
  if (!commune || !codePostal || !codeInsee) return null

  return {
    commune,
    communeCodePostal: codePostal,
    communeCodeInsee: codeInsee,
    score: feature.properties.score,
  }
}

// Helper partagé (aucune dépendance feature) : réutilisé par la synchro/backfill
// RDVSP et par le port bénéficiaire d'ingestion externe. Ignore le score.
export const communeFieldsFromAddress = async (
  address: string | null | undefined,
): Promise<CommuneFields | null> => {
  const scored = await scoredCommuneFieldsFromAddress(address)
  if (!scored) return null

  const { score: _score, ...fields } = scored
  return fields
}
