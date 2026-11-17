import { Pictogram } from '@app/web/features/pictograms/pictogram'

export const CentreAideConseillerNumeriqueLogo: Pictogram = ({
  width = 24,
  height = 24,
  ...props
}) => (
  <svg
    width={width}
    height={height}
    {...props}
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M12.034 0 4.875 4.133V12.4L11.641 24h.775l6.709-11.6V4.133Z"
      fill="#E1000F"
    />
    <path
      d="M12.01 2.816 7.27 5.553v5.423l4.74 2.74 4.72-2.722V9.437l-2.706-.004L12 10.603l-2.06-1.19V7.05l2.062-1.19 2.023 1.216 2.692-.018V5.49Z"
      fill="#FFFFFF"
    />
    <path
      d="M12.019 5.86 9.957 7.05v2.363l2.06 1.19 2.026-1.17V7.076Z"
      fill="#000091"
    />
  </svg>
)
