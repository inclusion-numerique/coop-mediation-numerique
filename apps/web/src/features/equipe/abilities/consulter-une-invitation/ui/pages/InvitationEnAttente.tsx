import LogoCoop from '@app/web/components/LogoCoop'
import Link from 'next/link'
import type { ReactNode } from 'react'
import type { CoordinateurInvitant } from '../../domain'

const InvitationEnAttente = ({
  coordinateur,
  tailleEquipe,
  reponse,
}: {
  coordinateur: CoordinateurInvitant
  tailleEquipe: number
  reponse: ReactNode
}) => (
  <div className="fr-layout__main fr-container-fluid fr-height-full">
    <div className="fr-grid-row fr-height-full">
      <div className="fr-col-md-6 fr-col-12">
        <div className="fr-flex fr-align-items-center fr-mx-auto fr-height-full ">
          <div className="fr-mx-auto fr-flex fr-container--slim fr-direction-column fr-flex-gap-10v fr-justify-content-space-between fr-px-12v">
            <div className="fr-flex fr-align-items-center fr-flex-gap-3v">
              <LogoCoop height={48} width={48} />
              <span className="fr-text--xl fr-text--semi-bold fr-mb-0">
                La Coop de la médiation numérique
              </span>
            </div>
            <div>
              <h1 className="fr-text-title--blue-france">
                Invitation à rejoindre une équipe
              </h1>
              <p>
                En rejoignant cette équipe, {coordinateur.nom} pourra&nbsp;:
              </p>
              <ul>
                <li>
                  Voir vos informations de profil (Nom prénom, contacts mail et
                  téléphone, profession)
                </li>
                <li>Visualiser vos statistiques d’activités</li>
              </ul>
              <p>En rejoignant cette équipe, vous pourrez&nbsp;:</p>
              <ul>
                <li>
                  Voir les autres membres de votre équipe et leurs informations
                  de profils (Nom prénom, contacts mail et téléphone,
                  profession)
                </li>
              </ul>
            </div>
            <div className="fr-text--center">
              {reponse}
              <Link
                className="fr-link"
                target="_blank"
                rel="noreferrer"
                href="https://docs.numerique.gouv.fr/docs/cb90ba5c-6115-4996-8f1d-153be7eb4211/"
              >
                En savoir plus sur La Coop de la médiation numérique
              </Link>
            </div>
          </div>
        </div>
      </div>
      <div className="fr-col-6 fr-hidden fr-unhidden-md fr-background-alt--blue-france">
        <div className="fr-flex fr-align-items-center fr-mx-auto fr-p-8w">
          <div
            className="fr-background-default--grey fr-border-radius--16 fr-p-12v"
            style={{ maxWidth: '443px' }}
          >
            <div className="fr-p-4v fr-background-alt--blue-france fr-border-radius--8 fr-display-inline-block">
              <span className="fr-text--lg fr-mb-0 fr-text--bold fr-text-label--blue-france">
                <span
                  className="ri-group-2-line ri-lg fr-text--semi-bold fr-mr-2v"
                  aria-hidden
                />
                Mon équipe
              </span>
            </div>
            <div className="fr-border-top fr-border--bottom fr-py-8v fr-my-8v">
              <div className="fr-text--xl fr-mb-0 fr-text--bold">
                Équipe coordonnée par {coordinateur.nom}
              </div>
              <div className="fr-text--sm fr-mb-0 fr-text-mention--grey">
                <span className="ri-mail-line fr-mr-1w" aria-hidden />
                {coordinateur.email}
              </div>
              {coordinateur.telephone != null && (
                <div className="fr-text--sm fr-mb-0 fr-text-mention--grey">
                  <span className="ri-phone-line fr-mr-1w" aria-hidden />
                  {coordinateur.telephone}
                </div>
              )}
            </div>
            <div className="fr-text--lg fr-mb-0 fr-text--bold fr-text-label--blue-france">
              {tailleEquipe} membres dans l’équipe
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
)

export default InvitationEnAttente
