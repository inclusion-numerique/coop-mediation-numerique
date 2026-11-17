import IconInSquare from '@app/web/components/IconInSquare'

export const TitreDeSection = ({
  icone,
  children,
}: {
  icone: 'ri-home-smile-2-line'
  children: string
}) => (
  <div className="fr-flex fr-flex-gap-3v fr-align-items-center fr-mb-6v">
    <IconInSquare iconId={icone} size="small" />
    <h2 className="fr-text-title--blue-france fr-h6 fr-m-0">{children}</h2>
  </div>
)
