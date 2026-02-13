import Onboarding from '@app/web/app/(onboarding)/_components/Onboarding'
import Image from 'next/image'

export const OnboardingMonEquipeCoordinateur = () => (
  <Onboarding
    image={
      <Image
        className="fr-responsive-img"
        width={572}
        height={769}
        src="/images/illustrations/onboarding/mon-equipe.svg"
        alt=""
      />
    }
    title="Suivez les médiateurs numériques que vous coordonnez"
    label={
      <>
        <span className="ri-group-2-line ri-xl fr-mr-3v" aria-hidden />
        Mon équipe
      </>
    }
    stepIndex={2}
    totalSteps={3}
    previous={{ href: '/en-savoir-plus/coordinateur/mes-statistiques' }}
    next={{ href: '/en-savoir-plus/coordinateur/mes-outils' }}
    closeHref="/coop"
  >
    <p className="fr-text--xl">
      Retrouvez les conseillers et médiateurs numériques que vous coordonnez sur
      votre espace dans la section <strong>Mon équipe</strong>.
      <br className="fr-mb-6v" />
      Invitez de nouveaux médiateurs numériques à rejoindre votre équipe à tout
      moment.
    </p>
  </Onboarding>
)
