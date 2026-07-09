import { searchAdresse } from '@app/web/external-apis/apiAdresse'
import { banFeatureToAdresseBanData } from '@app/web/external-apis/ban/banFeatureToAdresseBanData'

export type CommuneFields = {
  commune: string
  communeCodePostal: string
  communeCodeInsee: string
}

// Géocode une adresse texte libre en commune complète (commune + code postal +
// code INSEE) via la BAN. Helper partagé (aucune dépendance feature) : réutilisé
// par la synchro/backfill RDVSP et par le port bénéficiaire d'ingestion externe.
export const communeFieldsFromAddress = async (
  address: string | null | undefined,
): Promise<CommuneFields | null> => {
  if (!address) return null

  const feature = await searchAdresse(address)
  if (!feature) return null

  const { commune, codePostal, codeInsee } = banFeatureToAdresseBanData(feature)
  if (!commune || !codePostal || !codeInsee) return null

  return {
    commune,
    communeCodePostal: codePostal,
    communeCodeInsee: codeInsee,
  }
}
