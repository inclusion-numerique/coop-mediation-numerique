import Image from 'next/image'
import Link from 'next/link'
import { OutilPageData } from '../../outilPageData'

export const Hero = ({
  title,
  illustration,
  illustrationWidth,
  pictogram: Pictogram,
  description,
  website,
  websiteLinkLabel,
}: OutilPageData) => (
  <section className="fr-p-5w fr-mb-3w fr-border-radius--16 fr-background-alt--brown-caramel fr-grid-row">
    <div className="fr-col-lg-8">
      <Pictogram width={illustrationWidth ?? 40} height={40} aria-hidden />
      <h1 className="fr-h4 fr-text-title--blue-france fr-my-1w">{title}</h1>
      <p className="fr-mb-1w">{description}</p>
      <Link
        className="fr-link"
        target="_blank"
        rel="noreferrer"
        title={`Accéder à ${title} - nouvel onglet`}
        href={website}
      >
        {websiteLinkLabel ?? 'Voir le site'}
      </Link>
    </div>
    <div className="fr-col-auto fr-mx-auto fr-mr-lg-0">
      <img style={{ width: 180, height: 180 }} src={illustration} alt="" />
    </div>
  </section>
)
