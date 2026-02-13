import Onboarding from '@app/web/app/(onboarding)/_components/Onboarding'
import Notice from '@codegouvfr/react-dsfr/Notice'
import Image from 'next/image'

export const OnboardingMesOutilsCoordinateur = () => (
  <Onboarding
    image={
      <Image
        className="fr-responsive-img fr-border-radius--16"
        width={541}
        height={538}
        src="/images/illustrations/onboarding/mes-outils.svg"
        alt=""
      />
    }
    title="Bénéficiez d’outils adaptés à vos besoins"
    label={
      <>
        <span className="ri-apps-2-line ri-xl fr-mr-3v" aria-hidden />
        Mes outils
      </>
    }
    stepIndex={3}
    totalSteps={3}
    previous={{ href: '/en-savoir-plus/coordinateur/mon-equipe' }}
    next={{ href: '/coop', isComplete: true }}
    closeHref="/coop"
  >
    <p className="fr-text--xl">
      Retrouvez une sélection d’outils et de services numériques dédiées à la
      médiation numérique dans une seule et même plateforme&nbsp;!
    </p>
    <Notice
      className="fr-notice--new fr-notice--flex"
      title={
        <span className="fr-text--regular">
          <span className="fr-text-default--grey fr-text--bold fr-display-block">
            Prochaines évolutions à venir !
          </span>
          <span className="fr-display-block fr-text--sm fr-my-1v">
            Amélioration du partage d’informations entre ces outils pour
            fluidifier l’organisation du travail.
          </span>
        </span>
      }
    />
  </Onboarding>
)
