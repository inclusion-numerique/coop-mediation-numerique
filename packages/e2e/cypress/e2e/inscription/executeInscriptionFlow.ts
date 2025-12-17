import { appUrl } from '@app/e2e/support/helpers'
import { CreateUserInput } from '@app/e2e/tasks/handlers/user.tasks'
import { getStepPath } from '@app/web/features/inscription/inscriptionFlow'
import { profileInscriptionLabels } from '@app/web/features/utilisateurs/use-cases/registration/profilInscription'

export type InscriptionFlowE2eExpectedStep =
  | {
      step: 'choisir-role'
      role: keyof typeof profileInscriptionLabels
      acceptCgu: boolean
      check?: () => void
    }
  | {
      step: 'verifier-informations'
      check?: () => void
      accept: boolean
    }
  | {
      step: 'lieux-activite'
      check?: () => void
      structureEmployeuseIsLieuActivite: boolean
    }
  | {
      step: 'lieux-activite'
      check?: () => void
      // TODO add lieu etc...
    }
  | {
      step: 'recapitulatif'
      acceptCgu?: boolean // if undefined, it should not be existing on page, else check
      check?: () => void
    }

const mutationAndNavigationTimeout = 15_000
const cguLabelMatch = /J’ai lu et j’accepte/

const handleStep = (step: InscriptionFlowE2eExpectedStep) => {
  if (step.step === 'choisir-role') {
    cy.appUrlShouldBe(getStepPath('choisir-role'), {
      timeout: mutationAndNavigationTimeout,
    })

    cy.intercept('/api/trpc/inscription.choisirProfilEtAccepterCgu*').as(
      'choisirProfilMutation',
    )

    cy.contains(profileInscriptionLabels[step.role]).click()

    if (step.acceptCgu) {
      cy.findByRole('checkbox', { name: cguLabelMatch }).check({ force: true })
    }

    step.check?.()

    cy.get('button').contains('Continuer').click()

    cy.wait('@choisirProfilMutation', { timeout: mutationAndNavigationTimeout })

    return
  }

  if (step.step === 'verifier-informations') {
    cy.appUrlShouldBe(getStepPath('verifier-informations'), {
      timeout: mutationAndNavigationTimeout,
    })
    step.check?.()
    if (step.accept) {
      cy.contains('Continuer').click()
    } else {
      cy.contains('Annuler').click()
    }
    return
  }

  if (
    step.step === 'lieux-activite' &&
    'structureEmployeuseIsLieuActivite' in step
  ) {
    cy.appUrlShouldBe(`${getStepPath('lieux-activite')}/structure-employeuse`, {
      timeout: mutationAndNavigationTimeout,
    })

    cy.intercept(
      '/api/trpc/inscription.ajouterStructureEmployeuseEnLieuActivite*',
    ).as('ajouterStructureEmployeuseMutation')

    step.check?.()
    if (step.structureEmployeuseIsLieuActivite) {
      cy.contains('Oui').click()
    } else {
      cy.contains('Non').click()
    }

    cy.wait('@ajouterStructureEmployeuseMutation', {
      timeout: mutationAndNavigationTimeout,
    })

    return
  }
  if (
    step.step === 'lieux-activite' &&
    !('structureEmployeuseIsLieuActivite' in step)
  ) {
    cy.appUrlShouldBe(getStepPath('lieux-activite'), {
      timeout: mutationAndNavigationTimeout,
    })

    cy.intercept('/api/trpc/inscription.renseignerLieuxActivite*').as(
      'renseignerLieuxActiviteMutation',
    )

    step.check?.()

    cy.contains('Suivant').click()

    cy.wait('@renseignerLieuxActiviteMutation', {
      timeout: mutationAndNavigationTimeout,
    })

    return
  }

  if (step.step === 'recapitulatif') {
    if (step.acceptCgu === undefined) {
      cy.findByRole('checkbox', { name: cguLabelMatch }).should('not.exist')
    } else if (step.acceptCgu) {
      cy.findByRole('checkbox', { name: cguLabelMatch }).check({ force: true })
    } else {
      cy.findByRole('checkbox', { name: cguLabelMatch }).should('be.visible')
    }

    cy.appUrlShouldBe(getStepPath('recapitulatif'), {
      timeout: mutationAndNavigationTimeout,
    })

    cy.intercept('/api/trpc/inscription.validerInscription*').as(
      'validerInscriptionMutation',
    )

    step.check?.()
    cy.contains('Valider mon inscription').click()

    cy.wait('@validerInscriptionMutation', {
      timeout: mutationAndNavigationTimeout,
    })

    return
  }

  throw new Error('Expected inscription step not recognized')
}

export const executeInscriptionFlow = ({
  signin,
  user,
  expectedSteps,
  expectSuccessToast,
  expectOnboarding,
  skipOnboarding = false,
}: {
  signin: boolean
  user: CreateUserInput
  expectedSteps: [
    InscriptionFlowE2eExpectedStep,
    ...InscriptionFlowE2eExpectedStep[],
  ]
  expectSuccessToast: boolean
  expectOnboarding?: 'none' | 'mediateur' | 'coordinateur'
  skipOnboarding?: boolean
}) => {
  if (signin) {
    cy.signin(user)
  }

  cy.visit(appUrl(getStepPath('initialize')))

  for (const step of expectedSteps) {
    handleStep(step)
  }
  if (expectSuccessToast) {
    cy.getToast(/Votre inscription a bien été validée/i).should('exist')
  }

  if (expectOnboarding) {
    if (
      expectOnboarding === 'mediateur' ||
      expectOnboarding === 'coordinateur'
    ) {
      // Same onboarding landing for mediateur and coordinateur
      cy.appUrlShouldBe('/en-savoir-plus', {
        timeout: mutationAndNavigationTimeout,
      })
    } else {
      cy.appUrlShouldBe('/coop', { timeout: mutationAndNavigationTimeout })
    }
  }

  if (skipOnboarding) {
    // find link with text "Voir plus tard"
    cy.findByRole('link', { name: 'Voir plus tard' }).click()
    cy.appUrlShouldBe('/coop', { timeout: mutationAndNavigationTimeout })
  }
}
