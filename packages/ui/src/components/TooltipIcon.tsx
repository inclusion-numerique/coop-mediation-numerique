import classNames from 'classnames'
import styles from './TooltipIcon.module.css'

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
      className={classNames(styles.tooltipButton, className)}
      aria-describedby={tooltipId}
    >
      <span className="ri-question-line" aria-hidden />
    </button>
  </>
)

export default TooltipIcon
