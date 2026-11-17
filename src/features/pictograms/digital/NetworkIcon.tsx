import { Pictogram } from '@app/web/features/pictograms/pictogram'

export const NetworkIcon: Pictogram = ({
  width = 80,
  height = 80,
  ...props
}) => (
  <svg
    width={width}
    height={height}
    {...props}
    viewBox="0 0 80 80"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="m53.713 25.187-4.97 7.442-1.6-1.2 4.97-7.442zm9.805 21-4-21 1.964-.374 4 21zm-4.94 5.22-8.71-3.5.846-1.813 8.709 3.5zM44.076 64.095l16-7.5.849 1.81-16 7.5zM32.857 45.94l-11.515 4-.684-1.88 11.515-4zm1.552 19.866-15-11 1.182-1.612 15 11z"
      className="fr-artwork-major"
    />
    <path
      d="m39.505 61.9 1-11.186 1.99.2-1 11.185z"
      className="fr-artwork-minor"
    />
    <path
      d="m36.085 32.357-5.97-11.393 1.77-.928 5.972 11.393zM49.804 16.98l-15-3 .392-1.96 15 3zM23.6 19.8l-8 6-1.2-1.6 8-6zm-9.586 26.364-2-12 1.973-.328 2 12z"
      className="fr-artwork-major"
    />
    <path d="m32.116 37.857-15-6L17.86 30l15 6z" className="fr-artwork-minor" />
    <path
      fillRule="evenodd"
      d="M42.144 49.643a8.929 8.929 0 1 0 0-17.857 8.929 8.929 0 0 0 0 17.857m0 1.786c5.917 0 10.714-4.797 10.714-10.715C52.858 34.797 48.061 30 42.144 30S31.43 34.797 31.43 40.714 36.227 51.43 42.144 51.43"
      className="fr-artwork-minor"
    />
    <path
      fillRule="evenodd"
      d="M66 59a6 6 0 1 0 0-12 6 6 0 0 0 0 12m0 2a8 8 0 1 0 0-16 8 8 0 0 0 0 16M28 20a6 6 0 1 0 0-12 6 6 0 0 0 0 12m0 2a8 8 0 1 0 0-16 8 8 0 0 0 0 16m12 49a4 4 0 1 0 0-8 4 4 0 0 0 0 8m0 2a6 6 0 1 0 0-12 6 6 0 0 0 0 12"
      className="fr-artwork-major"
    />
    <path
      fillRule="evenodd"
      d="M12 33a4 4 0 1 0 0-8 4 4 0 0 0 0 8m0 2a6 6 0 1 0 0-12 6 6 0 0 0 0 12"
      className="fr-artwork-minor"
    />
    <path
      fillRule="evenodd"
      d="M57.144 25.429a6.857 6.857 0 1 0 0-13.715 6.857 6.857 0 0 0 0 13.715m0 1.714a8.572 8.572 0 1 0 0-17.143 8.572 8.572 0 0 0 0 17.143M16 55a4 4 0 1 0 0-8 4 4 0 0 0 0 8m0 2a6 6 0 1 0 0-12 6 6 0 0 0 0 12"
      className="fr-artwork-major"
    />
  </svg>
)
