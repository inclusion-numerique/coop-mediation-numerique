import Cookies from 'js-cookie'

export const getNouvelleFonctionnaliteCookieName = (featureId: string) =>
  `nouvelle-fonctionnalite-${featureId}`

// If this cookie is set, the new feature card is masked
export const getNouvelleFonctionnaliteSkipCookie = ({
  featureId,
}: { featureId: string }) => {
  return Cookies.get(getNouvelleFonctionnaliteCookieName(featureId))
}

// Set the cookie to skip the new feature card
export const setNouvelleFonctionnaliteSkipCookie = ({
  featureId,
  expiration,
}: { featureId: string; expiration: Date | 'session' }) => {
  Cookies.set(getNouvelleFonctionnaliteCookieName(featureId), 'skip', {
    sameSite: 'strict',
    expires: expiration === 'session' ? undefined : expiration,
  })
}
