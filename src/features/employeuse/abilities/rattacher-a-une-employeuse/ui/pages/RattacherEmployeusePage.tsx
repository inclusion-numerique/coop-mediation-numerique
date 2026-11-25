import Notice from '@codegouvfr/react-dsfr/Notice'
import type { ReactNode } from 'react'
import { contentId } from '@/libraries/liens-d-evitement'
import { SkipLinksPortal } from '@/libraries/liens-d-evitement/composants'
import { IconInSquare } from '@/libraries/ui/components'

const RattacherEmployeusePage = ({
  motif,
  formulaire,
}: {
  motif: string
  formulaire: ReactNode
}) => (
  <div className="fr-container fr-container--800">
    <SkipLinksPortal />
    <main id={contentId} className="fr-mb-16w">
      <div className="fr-flex fr-flex-wrap fr-direction-row fr-align-items-center fr-flex-gap-4v fr-my-12v">
        <IconInSquare iconId="fr-icon-building-line" />
        <h1 className="fr-page-title fr-m-0">
          Renseignez votre structure employeuse
        </h1>
      </div>
      <Notice
        className="fr-mb-6v"
        title={`${motif} nécessite de savoir où vous exercez.`}
        description="Nous n’avons plus de structure employeuse à votre nom — un contrat arrivé à son terme, par exemple. Indiquez-la pour continuer."
      />
      <p className="fr-text--sm fr-text-mention--grey fr-mb-6v">
        Votre structure employeuse est l’organisation qui vous emploie en tant
        que médiateur numérique. Recherchez-la par son nom, son SIRET ou son
        adresse.
      </p>
      {formulaire}
    </main>
  </div>
)

export default RattacherEmployeusePage
