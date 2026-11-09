import Link from 'next/link'
import type { VisibiliteSurLaCartographie } from '../domain'
import {
  compteAffiche,
  lieuxDuDepartementAffiches,
} from './acces-cartographie-nationale.presenter'
import { lienDeLaCartographie } from './lien-de-la-cartographie.presenter'

export const AccesCartographieNationale = ({
  departement,
  lieuxVisiblesDuMediateur,
  lieuxDuDepartement,
}: VisibiliteSurLaCartographie) => (
  <div className="fr-flex fr-direction-column fr-flex-gap-6v">
    <div className="fr-text-label--blue-france fr-background-alt--blue-france fr-p-8v fr-border-radius--8">
      <div className="fr-mb-4v fr-flex fr-justify-content-space-between fr-align-items-center">
        <span className="fr-h1 fr-mb-0 fr-text-title--blue-france">
          {compteAffiche(lieuxVisiblesDuMediateur).nombre}
        </span>
        <span aria-hidden>
          <span className="ri-home-office-line fr-background-default--grey fr-p-3v fr-border-radius--8 ri-lg fr-line-height-1" />
        </span>
      </div>
      <p className="fr-mb-4v">
        <span className="fr-text--bold">de vos lieux d’activité</span>
        <br />
        {compteAffiche(lieuxVisiblesDuMediateur).phrase}
      </p>
      <Link className="fr-btn fr-btn--secondary" href="/coop/lieux-activite">
        Voir mes lieux d’activité&ensp;
        <span className="ri-arrow-right-line" aria-hidden />
      </Link>
    </div>
    <div className="fr-text-label--blue-france fr-background-alt--blue-france fr-p-8v fr-border-radius--8">
      <div className="fr-mb-4v fr-flex fr-justify-content-space-between fr-align-items-center">
        <span className="fr-h1 fr-mb-0 fr-text-title--blue-france">
          {compteAffiche(lieuxDuDepartement).nombre}
        </span>
        <span aria-hidden>
          <span className="fr-icon-france-line fr-background-default--grey fr-p-3v fr-border-radius--8 ri-lg fr-line-height-1" />
        </span>
      </div>
      <p className="fr-mb-4v">
        <span className="fr-text--bold">
          {lieuxDuDepartementAffiches(lieuxDuDepartement)}
        </span>
        <br />
        {compteAffiche(lieuxDuDepartement).phrase}
      </p>
      <Link
        href={lienDeLaCartographie(departement)}
        target="_blank"
        rel="noreferrer"
      >
        Voir sur la cartographie
      </Link>
    </div>
  </div>
)
