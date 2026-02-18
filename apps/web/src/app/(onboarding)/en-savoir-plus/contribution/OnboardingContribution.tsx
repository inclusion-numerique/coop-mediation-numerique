import Image from 'next/image'
import Onboarding from '../../_components/Onboarding'

export const OnboardingContribution = () => (
  <Onboarding
    image={
      <Image
        className="fr-responsive-img fr-border-radius--16"
        width={541}
        height={538}
        src="/images/illustrations/onboarding/france-numerique-ensemble.svg"
        alt=""
      />
    }
    title="Contribuez à rendre visible l’impact de l’inclusion numérique sur votre territoire"
    label={
      <Image
        width={32}
        height={32}
        src="/images/services/conseillers-numerique-logo-small.svg"
        alt=""
      />
    }
    stepIndex={5}
    totalSteps={5}
    previous={{ href: '/en-savoir-plus/mes-outils' }}
    next={{ href: '/coop', isComplete: true }}
    closeHref="/coop"
  >
    <p className="fr-text--lg">
      Les statistiques d’activités anonymisés, récoltés sur La Coop de la
      médiation numérique, contribuent à valoriser l’impact de la médiation
      numérique sur votre territoire. Ces données publiques permettent de suivre
      et de mesurer les besoins de la population et d’ajuster les stratégies
      locales d'inclusion numérique.
    </p>
  </Onboarding>
)
