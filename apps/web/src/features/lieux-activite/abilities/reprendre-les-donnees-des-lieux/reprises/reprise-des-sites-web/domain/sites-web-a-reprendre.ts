import { nettoyerSiteWeb, Url } from '@gouvfr-anct/lieux-de-mediation-numerique'
import {
  type LieuAReprendre,
  type ValeursAReprendre,
  valeursAReprendre,
} from '../../../domain'

const SEPARATEUR_DU_NETTOYEUR = '|'

const adressesRecuperees = (siteWeb: string): readonly string[] =>
  nettoyerSiteWeb(siteWeb)
    .split(SEPARATEUR_DU_NETTOYEUR)
    .flatMap((adresse) => {
      const propre = Url.safe(adresse.trim())

      return propre == null ? [] : [propre]
    })

const siteWebNettoye = (siteWeb: string): readonly string[] =>
  Url.safe(siteWeb) == null ? adressesRecuperees(siteWeb) : [siteWeb]

export const sitesWebAReprendre = (
  lieu: LieuAReprendre,
): ValeursAReprendre | null => valeursAReprendre(lieu.siteWeb, siteWebNettoye)
