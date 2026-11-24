import classNames from 'classnames'

const TooltipIcon = ({
  tooltipId,
  className,
}: {
  tooltipId: string
  className?: string
}) => (
  <>
    <button
      type="button"
      className={classNames('bouton-d-infobulle', className)}
      aria-describedby={tooltipId}
    >
      <span className="ri-question-line" aria-hidden />
    </button>
  </>
)

export default TooltipIcon
