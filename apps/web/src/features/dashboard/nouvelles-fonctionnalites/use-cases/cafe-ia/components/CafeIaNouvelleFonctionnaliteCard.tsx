import NouvelleFonctionnaliteCard from '@app/web/features/dashboard/nouvelles-fonctionnalites/components/NouvelleFonctionnaliteCard'
import SnoozeNouvelleFonctionnaliteButton from '../../../components/SnoozeNouvelleFonctionnaliteButton'
import CafeIaDecouvrirButton from './CafeIaDecouvrirButton'

const cafeIaFeatureId = 'cafe-ia'

const CafeIaNouvelleFonctionnaliteCard = () => (
  <NouvelleFonctionnaliteCard
    featureId={cafeIaFeatureId}
    showFrom={new Date('2025-06-01')}
    showUntil={new Date('2025-10-01')}
    featureName="Animation Café IA"
    illustration={
      <img
        src="/images/fonctionnalites/cafe-ia-logo.png"
        alt=""
        style={{ width: '100%' }}
      />
    }
    action={
      <div>
        <CafeIaDecouvrirButton />
        <SnoozeNouvelleFonctionnaliteButton
          className="fr-ml-2v"
          featureId={cafeIaFeatureId}
        />
      </div>
    }
  >
    <p className="fr-mb-0 fr-text--medium">
      À partir d’aujourd’hui, référencez-vous pour être identifié comme
      animateur de Café IA&nbsp;!
    </p>
  </NouvelleFonctionnaliteCard>
)

export default CafeIaNouvelleFonctionnaliteCard
