import Image from 'next/image'
import Onboarding from '../../_components/Onboarding'

export const OnboardingMesArchives = () => (
  <Onboarding
    image={
      <Image
        className="fr-responsive-img"
        width={476}
        height={437}
        src="/images/illustrations/onboarding/mes-archives.svg"
        alt=""
      />
    }
    title="Vos données de l’Espace Coop V.1 ont été archivées"
    label={
      <>
        <span className="ri-archive-line ri-lg fr-mr-1w" aria-hidden />
        Mes archives - Coop V.1
      </>
    }
    stepIndex={5}
    totalSteps={5}
    previous={{ href: '/en-savoir-plus/mes-outils' }}
    next={{ href: '/coop', isComplete: true }}
    closeHref="/coop"
  >
    <p className="fr-text--lg">
      Retrouvez l’historique de vos comptes rendus d’activité (CRA) et vos
      statistiques de la version précédente de l’espace Coop disponibles sous
      forme d’exports sur une page dédiée&nbsp;:{' '}
      <strong>Mes archives - Coop V.1</strong>.
    </p>
  </Onboarding>
)
