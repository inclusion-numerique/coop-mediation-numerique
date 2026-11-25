import Image from 'next/image'
import Link from 'next/link'
import { routeConstruite } from '@/libraries/nextjs'
import type {
  FicheOutil,
  InformationDAcces,
} from '../labels/fiches/fiche-outil.labels'

export const AccessInfoLink = ({
  illustration,
  icon,
  how,
  info,
}: Pick<NonNullable<FicheOutil['access']>, 'how'> & {
  illustration?: string | undefined
  icon?: string | undefined
  info?: InformationDAcces | undefined
}) => (
  <div className="fr-text--center fr-background-alt--blue-france fr-border-radius--8 fr-p-3w fr-mb-3w">
    {illustration && <Image width={84} height={56} src={illustration} alt="" />}
    {icon && (
      <div
        className={`${icon} fr-text-label--blue-france fr-icon--lg fr-mt-1w fr-mb-3w`}
        aria-hidden
      />
    )}
    <p className="fr-text fr-mb-4v">{how}</p>

    {info?.link.startsWith('http') ? (
      <a
        className="fr-link"
        target="_blank"
        rel="noreferrer"
        title={`${info.label} - nouvel onglet`}
        href={info.link}
      >
        {info.label}
      </a>
    ) : info ? (
      <Link className="fr-link" href={routeConstruite(info.link)}>
        {info.label} <span className="ri-arrow-right-line" aria-hidden />
      </Link>
    ) : null}
  </div>
)
