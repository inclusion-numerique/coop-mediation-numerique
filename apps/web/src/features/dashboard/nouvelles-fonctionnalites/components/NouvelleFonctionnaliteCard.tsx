import { PublicWebAppConfig } from '@app/web/PublicWebAppConfig'
import { FrIconClassName } from '@codegouvfr/react-dsfr'
import Badge from '@codegouvfr/react-dsfr/Badge'
import { cookies } from 'next/headers'
import type { PropsWithChildren, ReactNode } from 'react'
import { getNouvelleFonctionnaliteCookieName } from '../nouvelleFonctionnaliteCookie'
import SupprimerNouvelleFonctionnaliteCardButton from './SupprimerNouvelleFonctionnaliteCardButton'

const NouvelleFonctionnaliteCard = async ({
  featureId,
  showFrom,
  showUntil,
  featureName,
  illustration,
  children,
  action,
}: PropsWithChildren<{
  // Children est le texte du contenu de la carte
  featureId: string // Identifiant unique de la fonctionnalité
  showFrom: Date // Date de début de l'affichage de la carte (toujours affichée en environnement de développement / preview)
  showUntil: Date // Date de fin de l'affichage de la carte
  featureName: NonNullable<ReactNode> // Nom de la fonctionnalité affichée en haut de la carte
  illustration: ReactNode // Illustration de la fonctionnalité affichée à gauche de la carte
  action: ReactNode // Action(s) à afficher en bas de la carte
}>) => {
  const cookieStore = await cookies()
  const skipCookie = cookieStore.get(
    getNouvelleFonctionnaliteCookieName(featureId),
  )
  const now = new Date()

  const isVisible =
    // If the skip cookie is set, the feature card is masked
    !skipCookie &&
    // Always visible in preview or local environment
    (!PublicWebAppConfig.isMain || now >= showFrom) &&
    now <= showUntil

  if (!isVisible) {
    return null
  }

  return (
    <div className="fr-background-alt--yellow-tournesol fr-px-8v fr-py-6v fr-mt-6v fr-border-radius--16 fr-flex fr-flex-gap-8v fr-align-items-center">
      <div
        style={{ width: 128 }}
        className="fr-flex-shrink-0 fr-flex-grow-0 fr-flex fr-align-items-center fr-justify-content-center"
      >
        {illustration}
      </div>
      <div className="fr-flex-grow-1">
        <div className="fr-flex fr-width-full fr-align-items-start fr-justify-content-space-between fr-mb-2v">
          <Badge
            small
            className="fr-badge--new fr-mb-0 fr-py-1v fr-text--uppercase"
          >
            {featureName}
          </Badge>
          <SupprimerNouvelleFonctionnaliteCardButton featureId={featureId} />
        </div>
        {children}
        <div className="fr-mt-4v">{action}</div>
      </div>
    </div>
  )
}

export default NouvelleFonctionnaliteCard
