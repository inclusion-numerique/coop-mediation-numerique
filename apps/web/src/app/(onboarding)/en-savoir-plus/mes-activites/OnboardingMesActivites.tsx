import Image from 'next/image'
import Onboarding from '../../_components/Onboarding'

export const OnboardingMesActivites = () => (
  <Onboarding
    image={
      <Image
        className="fr-responsive-img"
        width={444}
        height={440}
        src="/images/illustrations/onboarding/mes-activites.svg"
        alt=""
      />
    }
    title="Enregistrez vos activités de médiation numérique"
    label={
      <>
        <span className="ri-service-line ri-xl fr-mr-3v" aria-hidden />
        Mes activités
      </>
    }
    stepIndex={1}
    totalSteps={5}
    next={{ href: '/en-savoir-plus/mes-statistiques' }}
    closeHref="/coop"
  >
    <p className="fr-text--lg">
      Grâce à des comptes rendus d’activité adaptés à{' '}
      <strong>2 types d’accompagnement</strong>&nbsp;:
    </p>
    <ul>
      <li>Accompagnement individuel</li>
      <li>Atelier collectif</li>
    </ul>
  </Onboarding>
)
