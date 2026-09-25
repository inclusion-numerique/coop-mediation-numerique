import { nettoyerSiteWeb, Url } from '@gouvfr-anct/lieux-de-mediation-numerique'
import {
  type LieuAReprendre,
  type ValeursAReprendre,
  valeursAReprendre,
} from '../../../domain'
import { adressesCollees, sansLeGabarit } from './gabarit-de-site-web'

const SEPARATEUR_DU_NETTOYEUR = '|'

const adressesValides = (adresses: readonly string[]): readonly string[] =>
  adresses.flatMap((adresse) => {
    const propre = Url.safe(adresse.trim())

    return propre == null ? [] : [propre]
  })

const adressesRecuperees = (siteWeb: string): readonly string[] =>
  adressesValides(nettoyerSiteWeb(siteWeb).split(SEPARATEUR_DU_NETTOYEUR))

const adresseNettoyee = (siteWeb: string): readonly string[] => {
  const sansGabarit = sansLeGabarit(siteWeb)

  return Url.safe(sansGabarit) == null
    ? adressesRecuperees(sansGabarit)
    : [sansGabarit]
}

const siteWebNettoye = (siteWeb: string): readonly string[] =>
  adressesCollees(siteWeb).flatMap(adresseNettoyee)

export const sitesWebAReprendre = (
  lieu: LieuAReprendre,
): ValeursAReprendre | null => valeursAReprendre(lieu.siteWeb, siteWebNettoye)
