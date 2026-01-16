import IconInSquare from '@app/web/components/IconInSquare'
import { numberToString } from '@app/web/utils/formatNumber'
import type { ButtonProps } from '@codegouvfr/react-dsfr/Button'
import Button from '@codegouvfr/react-dsfr/Button'

const MonReseauCountStatCard = ({
  count,
  label,
  iconId,
  href,
  linkLabel,
}: {
  count: number
  label: string
  iconId: ButtonProps.IconOnly['iconId']
  href: string
  linkLabel: string
}) => (
  <div className="fr-p-4w fr-border-radius--16 fr-background-alt--blue-france fr-height-full">
    <div className="fr-flex fr-justify-content-space-between fr-align-items-end">
      <div>
        <p className="fr-text-title--blue-france fr-display--sm fr-mb-0">
          {numberToString(count)}
        </p>
      </div>
      <IconInSquare
        iconId={iconId}
        size="48"
        background="fr-background-default--grey"
      />
    </div>
    <p className="fr-text--semi-bold fr-text-title--blue-france fr-text--lg fr-mt-4v fr-mb-0">
      {label}
    </p>
    <hr className="fr-separator-4v fr-separator--default-grey" />
    <Button
      linkProps={{ href }}
      priority="tertiary no outline"
      size="small"
      iconId="fr-icon-arrow-right-line"
      iconPosition="right"
    >
      {linkLabel}
    </Button>
  </div>
)

export default MonReseauCountStatCard
