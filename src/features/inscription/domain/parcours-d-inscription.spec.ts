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

const sansDataspace: InscriptionContexte = {
  flowType: TypeDeParcours('withoutDataspace'),
  profil: null,
  hasLieuxActivite: false,
  isConseillerNumerique: false,
}

const avecDataspaceNonConseillerNumerique: InscriptionContexte = {
  ...sansDataspace,
  flowType: TypeDeParcours('withDataspace'),
}

const avecDataspaceConseillerNumerique: InscriptionContexte = {
  ...avecDataspaceNonConseillerNumerique,
  isConseillerNumerique: true,
}

describe('parcoursDInscription', () => {
  it('passe par Dataspace quand ses données sont présentes', () => {
    expect(parcoursDInscription({ hasDataspaceData: true })).toBe(
      'withDataspace',
    )
  })

  it('se passe de Dataspace quand ses données sont absentes', () => {
    expect(parcoursDInscription({ hasDataspaceData: false })).toBe(
      'withoutDataspace',
    )
  })
})

describe('etapeSuivante — flow sans Dataspace (ou non conseiller numérique)', () => {
  it('commence au choix du rôle', () => {
    expect(premiereEtape(sansDataspace)).toBe('choisir-role')
  })

  it('mène un médiateur du choix du rôle à la vérification des informations', () => {
    expect(
      etapeSuivante(EtapeDInscription('choisir-role'), {
        ...sansDataspace,
        profil: ProfilInscription('Mediateur'),
      }),
    ).toBe('verifier-informations')
  })

  it('mène un coordinateur du choix du rôle directement au récapitulatif', () => {
    expect(
      etapeSuivante(EtapeDInscription('choisir-role'), {
        ...sansDataspace,
        profil: ProfilInscription('Coordinateur'),
      }),
    ).toBe('recapitulatif')
  })

  it('mène un médiateur de la vérification des informations aux lieux d’activité', () => {
    expect(
      etapeSuivante(EtapeDInscription('verifier-informations'), {
        ...sansDataspace,
        profil: ProfilInscription('Mediateur'),
      }),
    ).toBe('lieux-activite')
  })

  it('mène un conseiller numérique de la vérification des informations aux lieux d’activité', () => {
    expect(
      etapeSuivante(EtapeDInscription('verifier-informations'), {
        ...sansDataspace,
        profil: ProfilInscription('ConseillerNumerique'),
      }),
    ).toBe('lieux-activite')
  })

  it('mène un coordinateur de la vérification des informations au récapitulatif', () => {
    expect(
      etapeSuivante(EtapeDInscription('verifier-informations'), {
        ...sansDataspace,
        profil: ProfilInscription('Coordinateur'),
      }),
    ).toBe('recapitulatif')
  })

  it('mène des lieux d’activité au récapitulatif', () => {
    expect(
      etapeSuivante(EtapeDInscription('lieux-activite'), sansDataspace),
    ).toBe('recapitulatif')
  })

  it('s’arrête au récapitulatif, étape terminale', () => {
    expect(
      etapeSuivante(EtapeDInscription('recapitulatif'), sansDataspace),
    ).toBeNull()
  })

  it('emprunte le flow entier même en Dataspace si non conseiller numérique', () => {
    expect(premiereEtape(avecDataspaceNonConseillerNumerique)).toBe(
      'choisir-role',
    )
  })
})

describe('etapeSuivante — flow Dataspace (conseiller numérique)', () => {
  it('commence à la vérification des informations pour un conseiller numérique sans lieu', () => {
    expect(
      premiereEtape({
        ...avecDataspaceConseillerNumerique,
        profil: ProfilInscription('ConseillerNumerique'),
        hasLieuxActivite: false,
      }),
    ).toBe('verifier-informations')
  })

  it('commence au récapitulatif pour un conseiller numérique avec lieu', () => {
    expect(
      premiereEtape({
        ...avecDataspaceConseillerNumerique,
        profil: ProfilInscription('ConseillerNumerique'),
        hasLieuxActivite: true,
      }),
    ).toBe('recapitulatif')
  })

  it('commence au récapitulatif pour un coordinateur conseiller numérique', () => {
    expect(
      premiereEtape({
        ...avecDataspaceConseillerNumerique,
        profil: ProfilInscription('CoordinateurConseillerNumerique'),
      }),
    ).toBe('recapitulatif')
  })

  it('commence au choix du rôle pour les autres profils', () => {
    expect(
      premiereEtape({
        ...avecDataspaceConseillerNumerique,
        profil: ProfilInscription('Mediateur'),
      }),
    ).toBe('choisir-role')
  })

  it('mène des lieux d’activité au récapitulatif', () => {
    expect(
      etapeSuivante(
        EtapeDInscription('lieux-activite'),
        avecDataspaceConseillerNumerique,
      ),
    ).toBe('recapitulatif')
  })

  it('s’arrête au récapitulatif, étape terminale', () => {
    expect(
      etapeSuivante(
        EtapeDInscription('recapitulatif'),
        avecDataspaceConseillerNumerique,
      ),
    ).toBeNull()
  })
})
