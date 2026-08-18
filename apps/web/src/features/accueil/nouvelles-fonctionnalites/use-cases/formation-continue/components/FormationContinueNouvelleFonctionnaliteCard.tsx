import NouvelleFonctionnaliteCard from '../../../components/NouvelleFonctionnaliteCard'
import SnoozeNouvelleFonctionnaliteButton from '../../../components/SnoozeNouvelleFonctionnaliteButton'
import FormationContinueDecouvrirButton from './FormationContinueDecouvrirButton'

const formationContinueFeatureId = 'formation-continue'

const FormationContinueNouvelleFonctionnaliteCard = () => (
  <NouvelleFonctionnaliteCard
    featureId={formationContinueFeatureId}
    showFrom={new Date('2025-09-15')}
    showUntil={new Date('2026-01-01')}
    featureName="Formation continue"
    illustration={
      <img
        src="/images/fonctionnalites/formation-continue.svg"
        alt=""
        style={{ width: '100%' }}
      />
    }
    action={
      <div>
        <FormationContinueDecouvrirButton />
        <SnoozeNouvelleFonctionnaliteButton
          className="fr-ml-2v"
          featureId={formationContinueFeatureId}
        />
      </div>
    }
  >
    <p className="fr-mb-0 fr-text--medium">
      Les inscriptions aux formations continues sont ouvertes&nbsp;!
    </p>
  </NouvelleFonctionnaliteCard>
)

export default FormationContinueNouvelleFonctionnaliteCard
