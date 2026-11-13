import { Button } from '@codegouvfr/react-dsfr/Button'
import { CarteDActivite } from '../../../../ui/carte/CarteDActivite'
import { DetailDeLActiviteModale } from '../../../../ui/detail/DetailDeLActiviteModale'
import { CreateCraModalDefinition } from '../../../../ui/saisie/CreateCraModal/CreateCraModalDefinition'
import type { DerniereActivite } from '../dernieres-activites.presenter'

const AucuneActiviteEnregistree = () => (
  <div className="fr-text--center fr-background-alt--blue-france fr-p-6w fr-border-radius--16">
    <p className="fr-text--bold fr-text--lg fr-mb-1w">
      Vous n’avez pas encore enregistré d’activité
    </p>
    <p className="fr-mb-4w">
      Vous pouvez enregistrer votre première activité en cliquant sur
      ‘Enregistrer une activité’.
    </p>
    <Button
      type="button"
      {...CreateCraModalDefinition.buttonProps}
      iconId="fr-icon-add-line"
    >
      Enregistrer une activité
    </Button>
  </div>
)

export const DernieresActivites = ({
  activites,
}: {
  activites: readonly DerniereActivite[]
}) => (
  <>
    <div className="fr-flex fr-flex-wrap fr-flex-gap-4v fr-align-items-center fr-justify-content-space-between fr-mb-3w">
      <h2 className="fr-h5 fr-text-mention--grey fr-mb-0">
        <span
          className="ri-service-line ri-lg fr-text--regular fr-mr-2v"
          aria-hidden
        />
        Mes 3 dernières activités enregistrées
      </h2>
      <Button
        priority="tertiary no outline"
        size="small"
        linkProps={{ href: '/coop/mes-activites' }}
        iconId="fr-icon-arrow-right-line"
        iconPosition="right"
      >
        Voir toutes mes activités
      </Button>
    </div>
    {activites.length > 0 ? (
      activites.map(({ carte, jour }, rang) => (
        <CarteDActivite
          key={carte.id}
          carte={carte}
          jour={jour}
          pile={{
            premiere: rang === 0,
            derniere: rang === activites.length - 1,
          }}
        />
      ))
    ) : (
      <AucuneActiviteEnregistree />
    )}
    <DetailDeLActiviteModale />
  </>
)
