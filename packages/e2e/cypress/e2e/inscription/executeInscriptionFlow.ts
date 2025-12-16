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
      check?: () => void
    }

const handleStep = (step: InscriptionFlowE2eExpectedStep) => {
  if (step.step === 'choisir-role') {
    cy.appUrlShouldBe(appUrl(getStepPath('choisir-role')))

    cy.intercept('/api/trpc/inscription.choisirProfilEtAccepterCgu*').as(
      'choisirProfilMutation',
    )

    cy.contains(profileInscriptionLabels[step.role]).click()

    if (step.acceptCgu) {
      cy.contains('J’ai lu et j’accepte').click()
    }

    step.check?.()

    cy.get('button').contains('Continuer').click()

    cy.wait('@choisirProfilMutation', { timeout: 15_000 })

    return
  }

  if (step.step === 'verifier-informations') {
    cy.appUrlShouldBe(appUrl(getStepPath('verifier-informations')))
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
    cy.appUrlShouldBe(
      appUrl(`${getStepPath('lieux-activite')}/structure-employeuse`),
    )

    cy.intercept(
      '/api/trpc/inscription.ajouterStructureEmployeuseEnLieuActivite*',
    ).as('ajouterStructureEmployeuseMutation')

    step.check?.()
    if (step.structureEmployeuseIsLieuActivite) {
      cy.contains('Oui').click()
    } else {
      cy.contains('Non').click()
    }

    cy.wait('@ajouterStructureEmployeuseMutation', { timeout: 15_000 })

    return
  }
  if (
    step.step === 'lieux-activite' &&
    !('structureEmployeuseIsLieuActivite' in step)
  ) {
    cy.appUrlShouldBe(appUrl(getStepPath('lieux-activite')))

    cy.intercept('/api/trpc/inscription.renseignerLieuxActivite*').as(
      'renseignerLieuxActiviteMutation',
    )

    step.check?.()

    cy.contains('Continuer').click()

    cy.wait('@renseignerLieuxActiviteMutation', { timeout: 15_000 })

    return
  }

  if (step.step === 'recapitulatif') {
    cy.appUrlShouldBe(appUrl(getStepPath('recapitulatif')))

    cy.intercept('/api/trpc/inscription.validerInscription*').as(
      'validerInscriptionMutation',
    )

    step.check?.()
    cy.contains('Valider mon inscription').click()

    cy.wait('@validerInscriptionMutation', { timeout: 15_000 })

    return
  }

  throw new Error('Expected inscription step not recognized')
}

export const executeInscriptionFlow = ({
  signin,
  user,
  expectedSteps,
}: {
  signin: boolean
  user: CreateUserInput
  expectedSteps: [
    InscriptionFlowE2eExpectedStep,
    ...InscriptionFlowE2eExpectedStep[],
  ]
}) => {
  if (signin) {
    cy.createUserAndSignin(user)
  }

  cy.visit(appUrl(getStepPath('initialize')))

  for (const step of expectedSteps) {
    handleStep(step)
  }

  cy.appUrlShouldBe(appUrl('/coop'))
}
