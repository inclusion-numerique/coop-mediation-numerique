import { Url } from '@gouvfr-anct/lieux-de-mediation-numerique'

const GABARITS = ['https://www.', 'http://www.']

const SCHEMAS = ['https://', 'http://']

const SEPARATEURS_COLLES = /%257C|\|/giu

const LONGUEUR_MINIMALE_DU_RESIDU = 3

const residusDe = (gabarit: string): readonly string[] =>
  [...gabarit]
    .map((_lettre, rang) => gabarit.slice(rang + 1))
    .filter((residu) => residu.length >= LONGUEUR_MINIMALE_DU_RESIDU)

const RESIDUS: readonly string[] = GABARITS.flatMap(residusDe).sort(
  (gauche, droite) => droite.length - gauche.length,
)

export const adressesCollees = (siteWeb: string): readonly string[] =>
  siteWeb
    .split(SEPARATEURS_COLLES)
    .map((adresse) => adresse.trim())
    .filter((adresse) => adresse !== '')

const sansPointDouble = (siteWeb: string): string =>
  siteWeb.replace(/^(https?:\/\/)www\.\./u, '$1')

const sansGabaritEnTete = (siteWeb: string): string => {
  const debut = Math.max(
    -1,
    ...SCHEMAS.map((schema) => siteWeb.lastIndexOf(schema)).filter(
      (rang) => rang > 0,
    ),
  )

  return debut > 0 ? siteWeb.slice(debut) : siteWeb
}

const sansGabaritEnQueue = (siteWeb: string): string => {
  const residu = RESIDUS.find(
    (candidat) =>
      siteWeb.length > candidat.length &&
      siteWeb.endsWith(candidat) &&
      Url.safe(siteWeb.slice(0, -candidat.length)) != null,
  )

  return residu == null ? siteWeb : siteWeb.slice(0, -residu.length)
}

export const sansLeGabarit = (siteWeb: string): string =>
  sansGabaritEnQueue(sansGabaritEnTete(sansPointDouble(siteWeb)))
