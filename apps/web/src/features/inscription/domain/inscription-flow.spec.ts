import {
  getInscriptionFlow,
  getNextInscriptionStep,
  type InscriptionContexte,
} from './inscription-flow'
import { InscriptionFlowType } from './inscription-flow-type'
import { InscriptionStep } from './inscription-step'
import { ProfilInscription } from './profil-inscription'

const contexte = (
  override: Partial<InscriptionContexte> = {},
): InscriptionContexte => ({
  flowType: InscriptionFlowType('withoutDataspace'),
  profil: null,
  hasLieuxActivite: false,
  isConseillerNumerique: false,
  ...override,
})

describe('getInscriptionFlow', () => {
  it('is withDataspace when Dataspace data is present', () => {
    expect(getInscriptionFlow({ hasDataspaceData: true })).toBe('withDataspace')
  })

  it('is withoutDataspace when Dataspace data is absent', () => {
    expect(getInscriptionFlow({ hasDataspaceData: false })).toBe(
      'withoutDataspace',
    )
  })
})

describe('getNextInscriptionStep — flow sans Dataspace (ou non conseiller numérique)', () => {
  const withoutDataspace = contexte({
    flowType: InscriptionFlowType('withoutDataspace'),
  })

  it('initialize → choisir-role', () => {
    expect(
      getNextInscriptionStep(InscriptionStep('initialize'), withoutDataspace),
    ).toBe('choisir-role')
  })

  it('choisir-role → verifier-informations pour un médiateur', () => {
    expect(
      getNextInscriptionStep(InscriptionStep('choisir-role'), {
        ...withoutDataspace,
        profil: ProfilInscription('Mediateur'),
      }),
    ).toBe('verifier-informations')
  })

  it('choisir-role → recapitulatif pour un coordinateur (raccourci)', () => {
    expect(
      getNextInscriptionStep(InscriptionStep('choisir-role'), {
        ...withoutDataspace,
        profil: ProfilInscription('Coordinateur'),
      }),
    ).toBe('recapitulatif')
  })

  it('verifier-informations → lieux-activite pour un médiateur', () => {
    expect(
      getNextInscriptionStep(InscriptionStep('verifier-informations'), {
        ...withoutDataspace,
        profil: ProfilInscription('Mediateur'),
      }),
    ).toBe('lieux-activite')
  })

  it('verifier-informations → lieux-activite pour un conseiller numérique', () => {
    expect(
      getNextInscriptionStep(InscriptionStep('verifier-informations'), {
        ...withoutDataspace,
        profil: ProfilInscription('ConseillerNumerique'),
      }),
    ).toBe('lieux-activite')
  })

  it('verifier-informations → recapitulatif pour un coordinateur', () => {
    expect(
      getNextInscriptionStep(InscriptionStep('verifier-informations'), {
        ...withoutDataspace,
        profil: ProfilInscription('Coordinateur'),
      }),
    ).toBe('recapitulatif')
  })

  it('lieux-activite → recapitulatif', () => {
    expect(
      getNextInscriptionStep(
        InscriptionStep('lieux-activite'),
        withoutDataspace,
      ),
    ).toBe('recapitulatif')
  })

  it('recapitulatif → null (terminal)', () => {
    expect(
      getNextInscriptionStep(
        InscriptionStep('recapitulatif'),
        withoutDataspace,
      ),
    ).toBeNull()
  })

  it('emprunte le flow complet même en Dataspace si non conseiller numérique', () => {
    expect(
      getNextInscriptionStep(InscriptionStep('initialize'), {
        ...contexte({ flowType: InscriptionFlowType('withDataspace') }),
        isConseillerNumerique: false,
      }),
    ).toBe('choisir-role')
  })
})

describe('getNextInscriptionStep — flow Dataspace (conseiller numérique)', () => {
  const withDataspace = contexte({
    flowType: InscriptionFlowType('withDataspace'),
    isConseillerNumerique: true,
  })

  it('initialize → verifier-informations pour un conseiller numérique sans lieu', () => {
    expect(
      getNextInscriptionStep(InscriptionStep('initialize'), {
        ...withDataspace,
        profil: ProfilInscription('ConseillerNumerique'),
        hasLieuxActivite: false,
      }),
    ).toBe('verifier-informations')
  })

  it('initialize → recapitulatif pour un conseiller numérique avec lieu', () => {
    expect(
      getNextInscriptionStep(InscriptionStep('initialize'), {
        ...withDataspace,
        profil: ProfilInscription('ConseillerNumerique'),
        hasLieuxActivite: true,
      }),
    ).toBe('recapitulatif')
  })

  it('initialize → recapitulatif pour un coordinateur conseiller numérique', () => {
    expect(
      getNextInscriptionStep(InscriptionStep('initialize'), {
        ...withDataspace,
        profil: ProfilInscription('CoordinateurConseillerNumerique'),
      }),
    ).toBe('recapitulatif')
  })

  it('initialize → choisir-role pour les autres profils', () => {
    expect(
      getNextInscriptionStep(InscriptionStep('initialize'), {
        ...withDataspace,
        profil: ProfilInscription('Mediateur'),
      }),
    ).toBe('choisir-role')
  })

  it('lieux-activite → recapitulatif', () => {
    expect(
      getNextInscriptionStep(InscriptionStep('lieux-activite'), withDataspace),
    ).toBe('recapitulatif')
  })

  it('recapitulatif → null (terminal)', () => {
    expect(
      getNextInscriptionStep(InscriptionStep('recapitulatif'), withDataspace),
    ).toBeNull()
  })
})
