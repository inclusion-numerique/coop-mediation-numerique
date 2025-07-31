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
    title="Suivez les conseillers numériques que vous coordonnez"
    label={
      <>
        <span className="ri-group-2-line ri-lg fr-mr-1w" aria-hidden />
        Mon équipe
      </>
    }
    stepIndex={2}
    totalSteps={4}
    previous={{ href: '/en-savoir-plus/coordinateur/mes-statistiques' }}
    next={{ href: '/en-savoir-plus/coordinateur/mes-archives' }}
    closeHref="/coop"
  >
    <p className="fr-text--lg">
      Retrouvez et gérez la liste des conseillers numériques que vous coordonnez
      sur votre espace dans la section Mon équipe. Vous pourrez également
      inviter d’autres conseillers et médiateurs numériques à rejoindre votre
      équipe.
    </p>
  </Onboarding>
)
