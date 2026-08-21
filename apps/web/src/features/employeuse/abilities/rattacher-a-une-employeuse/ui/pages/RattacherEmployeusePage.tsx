import IconInSquare from '@app/web/components/IconInSquare'
import SkipLinksPortal from '@app/web/components/SkipLinksPortal'
import { contentId } from '@app/web/utils/skipLinks'
import Notice from '@codegouvfr/react-dsfr/Notice'
import RattacherEmployeuseForm from '../RattacherEmployeuseForm'

/**
 * Demande d'employeuse hors inscription : ce que voit quelqu'un qui arrive sur
 * une page qui en exige une et n'en a plus.
 *
 * Le cas type est la fin d'un contrat de conseiller numérique. L'Entrepôt clôt
 * l'affectation, la personne reste médiatrice, et plus rien ne dit où elle
 * exerce — alors qu'exercer, c'est exercer quelque part. Plutôt que d'enregistrer
 * une activité rattachée à personne, on pose la question.
 *
 * `motif` laisse l'appelant nommer ce que la personne s'apprêtait à faire : la
 * demande est une interruption, et une interruption qui ne dit pas pourquoi
 * ressemble à une panne.
 */
const RattacherEmployeusePage = ({ motif }: { motif: string }) => (
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

      {/* Aucune étape suivante : une fois l'employeuse rattachée, la garde de la
          page demandée laisse passer, et le rafraîchissement l'affiche. */}
      <RattacherEmployeuseForm nextStepPath={null} />
    </main>
  </div>
)

export default RattacherEmployeusePage
