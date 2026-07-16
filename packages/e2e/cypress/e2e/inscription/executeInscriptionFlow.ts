import { appUrl } from '@app/e2e/support/helpers'
import { CreateUserInput } from '@app/e2e/tasks/handlers/user.tasks'
import { stepPath } from '@app/web/features/inscription/ui/step-path'
import {
  lowerCaseProfileInscriptionLabels,
  profileInscriptionConseillerNumeriqueLabels,
  profileInscriptionLabels,
} from '@app/web/features/utilisateurs/use-cases/registration/profilInscription'

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
      step: 'renseigner-structure-employeuse'
      check?: () => void
      // Terme recherché puis nom exact de la structure à choisir dans la liste.
      recherche: string
      choix: string
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
      conseillerNumeriqueRoleNotice:
        | 'none'
        | 'conseiller-numerique'
        | 'coordinateur-conseiller-numerique'
    }

const mutationAndNavigationTimeout = 15_000
const cguLabelMatch = /J’ai lu et j’accepte/

const handleStep = (step: InscriptionFlowE2eExpectedStep) => {
  if (step.step === 'choisir-role') {
    cy.appUrlShouldBe(stepPath('choisir-role'), {
      timeout: mutationAndNavigationTimeout,
    })

    // Le formulaire se desactive tant que la page n'est pas hydratee : cliquer
    // avant serait perdu sans aucun signe visible. On attend donc qu'il soit
    // actif, ce qui est aussi ce que voit un utilisateur.
    cy.get('input[type=radio][name=role]')
      .first()
      .should('be.enabled', { timeout: mutationAndNavigationTimeout })

    cy.contains(profileInscriptionLabels[step.role]).click()

    if (step.acceptCgu) {
      cy.findByRole('checkbox', { name: cguLabelMatch }).check({ force: true })
    }

    step.check?.()

    cy.get('button').contains('Continuer').click()

    // Cette étape passe par une server action, pas par tRPC : il n'y a aucune
    // requête nommée à intercepter. On synchronise sur la sortie de l'étape,
    // poussée par la page une fois l'action revenue — sinon les assertions de
    // l'étape suivante démarreraient encore sur celle-ci (le récapitulatif
    // vérifie l'absence de la checkbox CGU, qui est présente ici).
    cy.url({ timeout: mutationAndNavigationTimeout }).should(
      'not.contain',
      stepPath('choisir-role'),
    )

    return
  }

  if (step.step === 'verifier-informations') {
    cy.appUrlShouldBe(stepPath('verifier-informations'), {
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

  if (step.step === 'renseigner-structure-employeuse') {
    cy.appUrlShouldBe(getStepPath('renseigner-structure-employeuse'), {
      timeout: mutationAndNavigationTimeout,
    })

    step.check?.()

    // La recherche interroge le serveur (structures enregistrées + annuaire des
    // entreprises) : on attend qu'une option apparaisse avant de choisir.
    cy.findByRole('combobox').type(step.recherche)
    cy.contains(step.choix, { timeout: mutationAndNavigationTimeout }).click()

    // Parcours réel : on clique le bouton. Soumettre le formulaire directement
    // court-circuiterait la pose de la valeur dans le store TanStack.
    cy.get('button').contains('Continuer').click()

    return
  }

  if (
    step.step === 'lieux-activite' &&
    'structureEmployeuseIsLieuActivite' in step
  ) {
    cy.appUrlShouldBe(`${stepPath('lieux-activite')}/structure-employeuse`, {
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
    cy.appUrlShouldBe(stepPath('lieux-activite'), {
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

    cy.appUrlShouldBe(stepPath('recapitulatif'), {
      timeout: mutationAndNavigationTimeout,
    })

    if (step.conseillerNumeriqueRoleNotice === 'conseiller-numerique') {
      cy.contains(
        `Vous avez été identifié en tant que ${lowerCaseProfileInscriptionLabels.ConseillerNumerique}`,
      ).should('be.visible')
    } else if (
      step.conseillerNumeriqueRoleNotice === 'coordinateur-conseiller-numerique'
    ) {
      cy.contains(
        `Vous avez été identifié en tant que ${lowerCaseProfileInscriptionLabels.CoordinateurConseillerNumerique}`,
      ).should('be.visible')
    } else {
      cy.contains('Vous avez été identifié en tant que').should('not.exist')
    }

    // Cette étape passe désormais par une server action, pas par tRPC : aucune
    // requête nommée à intercepter. On synchronise sur la sortie du parcours
    // (toast de succès + navigation vers l'onboarding), vérifiée après la boucle.
    step.check?.()
    cy.contains('Valider mon inscription').click()

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

  cy.visit(appUrl(stepPath('initialize')))

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
