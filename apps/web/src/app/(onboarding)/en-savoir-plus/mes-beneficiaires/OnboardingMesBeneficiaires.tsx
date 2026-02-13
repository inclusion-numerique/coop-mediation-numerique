import Image from 'next/image'
import Onboarding from '../../_components/Onboarding'

export const OnboardingMesBeneficiaires = () => (
  <Onboarding
    image={
      <Image
        className="fr-responsive-img"
        width={505}
        height={444}
        src="/images/illustrations/onboarding/mes-beneficiaires.svg"
        alt=""
      />
    }
    title="Suivez l'évolution de vos bénéficiaires"
    label={
      <>
        <span className="ri-user-heart-line ri-xl fr-mr-3v" aria-hidden />
        Mes bénéficiaires
      </>
    }
    stepIndex={3}
    totalSteps={5}
    previous={{ href: '/en-savoir-plus/mes-statistiques' }}
    next={{ href: '/en-savoir-plus/mes-outils' }}
    closeHref="/coop"
  >
    <p className="fr-text--xl">
      Retrouvez l’historique d’accompagnement d’un bénéficiaire pour suivre son
      parcours complet vers l’autonomie avec notamment&nbsp;:
    </p>
    <ul>
      <li>Les thématiques vues lors des différents accompagnements</li>
      <li>L’évolution de son niveau d’autonomie</li>
    </ul>
  </Onboarding>
)
