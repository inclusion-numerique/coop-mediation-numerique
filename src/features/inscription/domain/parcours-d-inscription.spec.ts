import { describe, expect, it } from 'vitest'
import { EtapeDInscription } from './etape-d-inscription'
import {
  etapeSuivante,
  type InscriptionContexte,
  parcoursDInscription,
  premiereEtape,
} from './parcours-d-inscription'
import { ProfilInscription } from './profil-inscription'
import { TypeDeParcours } from './type-de-parcours'

const contexte = (
  override: Partial<InscriptionContexte> = {},
): InscriptionContexte => ({
  flowType: TypeDeParcours('withoutDataspace'),
  profil: null,
  hasLieuxActivite: false,
  isConseillerNumerique: false,
  ...override,
})

describe('parcoursDInscription', () => {
  it('is withDataspace when Dataspace data is present', () => {
    expect(parcoursDInscription({ hasDataspaceData: true })).toBe(
      'withDataspace',
    )
  })

  it('is withoutDataspace when Dataspace data is absent', () => {
    expect(parcoursDInscription({ hasDataspaceData: false })).toBe(
      'withoutDataspace',
    )
  })
})

describe('etapeSuivante — flow sans Dataspace (ou non conseiller numérique)', () => {
  const withoutDataspace = contexte({
    flowType: TypeDeParcours('withoutDataspace'),
  })

  it('initialize → choisir-role', () => {
    expect(premiereEtape(withoutDataspace)).toBe('choisir-role')
  })

  it('choisir-role → verifier-informations pour un médiateur', () => {
    expect(
      etapeSuivante(EtapeDInscription('choisir-role'), {
        ...withoutDataspace,
        profil: ProfilInscription('Mediateur'),
      }),
    ).toBe('verifier-informations')
  })

  it('choisir-role → recapitulatif pour un coordinateur (raccourci)', () => {
    expect(
      etapeSuivante(EtapeDInscription('choisir-role'), {
        ...withoutDataspace,
        profil: ProfilInscription('Coordinateur'),
      }),
    ).toBe('recapitulatif')
  })

  it('verifier-informations → lieux-activite pour un médiateur', () => {
    expect(
      etapeSuivante(EtapeDInscription('verifier-informations'), {
        ...withoutDataspace,
        profil: ProfilInscription('Mediateur'),
      }),
    ).toBe('lieux-activite')
  })

  it('verifier-informations → lieux-activite pour un conseiller numérique', () => {
    expect(
      etapeSuivante(EtapeDInscription('verifier-informations'), {
        ...withoutDataspace,
        profil: ProfilInscription('ConseillerNumerique'),
      }),
    ).toBe('lieux-activite')
  })

  it('verifier-informations → recapitulatif pour un coordinateur', () => {
    expect(
      etapeSuivante(EtapeDInscription('verifier-informations'), {
        ...withoutDataspace,
        profil: ProfilInscription('Coordinateur'),
      }),
    ).toBe('recapitulatif')
  })

  it('lieux-activite → recapitulatif', () => {
    expect(
      etapeSuivante(EtapeDInscription('lieux-activite'), withoutDataspace),
    ).toBe('recapitulatif')
  })

  it('recapitulatif → null (terminal)', () => {
    expect(
      etapeSuivante(EtapeDInscription('recapitulatif'), withoutDataspace),
    ).toBeNull()
  })

  it('emprunte le flow complet même en Dataspace si non conseiller numérique', () => {
    expect(
      premiereEtape({
        ...contexte({ flowType: TypeDeParcours('withDataspace') }),
        isConseillerNumerique: false,
      }),
    ).toBe('choisir-role')
  })
})

describe('etapeSuivante — flow Dataspace (conseiller numérique)', () => {
  const withDataspace = contexte({
    flowType: TypeDeParcours('withDataspace'),
    isConseillerNumerique: true,
  })

  it('initialize → verifier-informations pour un conseiller numérique sans lieu', () => {
    expect(
      premiereEtape({
        ...withDataspace,
        profil: ProfilInscription('ConseillerNumerique'),
        hasLieuxActivite: false,
      }),
    ).toBe('verifier-informations')
  })

  it('initialize → recapitulatif pour un conseiller numérique avec lieu', () => {
    expect(
      premiereEtape({
        ...withDataspace,
        profil: ProfilInscription('ConseillerNumerique'),
        hasLieuxActivite: true,
      }),
    ).toBe('recapitulatif')
  })

  it('initialize → recapitulatif pour un coordinateur conseiller numérique', () => {
    expect(
      premiereEtape({
        ...withDataspace,
        profil: ProfilInscription('CoordinateurConseillerNumerique'),
      }),
    ).toBe('recapitulatif')
  })

  it('initialize → choisir-role pour les autres profils', () => {
    expect(
      premiereEtape({
        ...withDataspace,
        profil: ProfilInscription('Mediateur'),
      }),
    ).toBe('choisir-role')
  })

  it('lieux-activite → recapitulatif', () => {
    expect(
      etapeSuivante(EtapeDInscription('lieux-activite'), withDataspace),
    ).toBe('recapitulatif')
  })

  it('recapitulatif → null (terminal)', () => {
    expect(
      etapeSuivante(EtapeDInscription('recapitulatif'), withDataspace),
    ).toBeNull()
  })
})
