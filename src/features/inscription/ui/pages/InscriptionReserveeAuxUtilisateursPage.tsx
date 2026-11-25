import Link from 'next/link'
import InscriptionStepsLayout from '../layouts/InscriptionStepsLayout'

export const InscriptionReserveeAuxUtilisateursPage = () => (
  <InscriptionStepsLayout>
    <div className="fr-mb-32v fr-p-12v fr-width-full fr-border-radius--8 fr-background-default--grey fr-mt-32v">
      <h2>Vous êtes connecté en tant qu’administrateur</h2>
      <p className="fr-text--xl">
        Les administrateurs n’ont pas accès au parcours d’inscription 😬
      </p>
      <Link className="fr-link" href="/administration/usurpation">
        Accéder à l’usurpation pour effectuer le parcours d’inscription en tant
        qu’utilisateur de test
        <span
          className="fr-icon-arrow-right-line fr-icon-arrow-right-line fr-icon--sm fr-ml-1w"
          aria-hidden
        />
      </Link>
    </div>
  </InscriptionStepsLayout>
)
