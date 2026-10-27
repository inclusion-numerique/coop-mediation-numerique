import Link from 'next/link'
import type { VisibiliteSurLaCartographie } from '../domain'

const pluralizeLieuxActiviteUser = (count: number): string => {
  switch (count) {
    case 0:
      return 'n’est visible sur la cartographie.'
    case 1:
      return 'est visible sur la cartographie.'
    default:
      return 'sont visibles sur la cartographie.'
  }
}

const pluralizeLieuxActiviteDepartement = (count: number) => {
  const label = count > 1 ? 'lieux d’activité' : 'lieu d’activité'
  const verb =
    count === 0
      ? 'n’est visible'
      : count === 1
        ? 'est visible'
        : 'sont visibles'

  return (
    <>
      <span className="fr-text--bold">{label} de votre département</span>
      <br />
      {verb} sur la cartographie.
    </>
  )
}

export const AccesCartographieNationale = ({
  lieuxVisiblesDuMediateur,
  lieuxDuDepartement,
  lienCartographie,
}: VisibiliteSurLaCartographie) => (
  <div className="fr-flex fr-direction-column fr-flex-gap-6v">
    <div className="fr-text-label--blue-france fr-background-alt--blue-france fr-p-8v fr-border-radius--8">
      <div className="fr-mb-4v fr-flex fr-justify-content-space-between fr-align-items-center">
        <span className="fr-h1 fr-mb-0 fr-text-title--blue-france">
          {lieuxVisiblesDuMediateur === 0 ? 'Aucun' : lieuxVisiblesDuMediateur}
        </span>
        <span aria-hidden>
          <span className="ri-home-office-line fr-background-default--grey fr-p-3v fr-border-radius--8 ri-lg fr-line-height-1" />
        </span>
      </div>
      <p className="fr-mb-4v">
        <span className="fr-text--bold">de vos lieux d’activité</span>
        <br />
        {pluralizeLieuxActiviteUser(lieuxVisiblesDuMediateur)}
      </p>
      <Link className="fr-btn fr-btn--secondary" href="/coop/lieux-activite">
        Voir mes lieux d’activité&ensp;
        <span className="ri-arrow-right-line" aria-hidden />
      </Link>
    </div>
    <div className="fr-text-label--blue-france fr-background-alt--blue-france fr-p-8v fr-border-radius--8">
      <div className="fr-mb-4v fr-flex fr-justify-content-space-between fr-align-items-center">
        <span className="fr-h1 fr-mb-0 fr-text-title--blue-france">
          {lieuxDuDepartement === 0 ? 'Aucun' : lieuxDuDepartement}
        </span>
        <span aria-hidden>
          <span className="fr-icon-france-line fr-background-default--grey fr-p-3v fr-border-radius--8 ri-lg fr-line-height-1" />
        </span>
      </div>
      <p className="fr-mb-4v">
        {pluralizeLieuxActiviteDepartement(lieuxDuDepartement)}
      </p>
      <Link href={lienCartographie} target="_blank" rel="noreferrer">
        Voir sur la cartographie
      </Link>
    </div>
  </div>
)
