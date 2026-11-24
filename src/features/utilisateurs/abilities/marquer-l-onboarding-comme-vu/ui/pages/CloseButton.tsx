import Button from '@codegouvfr/react-dsfr/Button'

export const CloseButton = ({ closeHref }: { closeHref: string }) => (
  <Button
    className="onboarding__fermer fr-position-absolute"
    iconId="fr-icon-close-line"
    priority="secondary"
    title="Fermer"
    linkProps={{ href: closeHref }}
  />
)
