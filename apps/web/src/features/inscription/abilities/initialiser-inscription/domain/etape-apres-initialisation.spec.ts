import { ProfilInscription } from '@app/web/features/inscription/domain'
import { etapeApresInitialisation } from './etape-apres-initialisation'

describe('etapeApresInitialisation', () => {
  it('sans données Dataspace → choisir-role', () => {
    expect(
      etapeApresInitialisation({
        hasDataspaceData: false,
        profil: null,
        hasLieuxActivite: false,
        isConseillerNumerique: false,
      }),
    ).toBe('choisir-role')
  })

  it('Dataspace mais non conseiller numérique → choisir-role (flow complet)', () => {
    expect(
      etapeApresInitialisation({
        hasDataspaceData: true,
        profil: ProfilInscription('Mediateur'),
        hasLieuxActivite: false,
        isConseillerNumerique: false,
      }),
    ).toBe('choisir-role')
  })

  it('conseiller numérique sans lieu → verifier-informations', () => {
    expect(
      etapeApresInitialisation({
        hasDataspaceData: true,
        profil: ProfilInscription('ConseillerNumerique'),
        hasLieuxActivite: false,
        isConseillerNumerique: true,
      }),
    ).toBe('verifier-informations')
  })

  it('conseiller numérique avec lieu → recapitulatif', () => {
    expect(
      etapeApresInitialisation({
        hasDataspaceData: true,
        profil: ProfilInscription('ConseillerNumerique'),
        hasLieuxActivite: true,
        isConseillerNumerique: true,
      }),
    ).toBe('recapitulatif')
  })

  it('coordinateur conseiller numérique → recapitulatif', () => {
    expect(
      etapeApresInitialisation({
        hasDataspaceData: true,
        profil: ProfilInscription('CoordinateurConseillerNumerique'),
        hasLieuxActivite: false,
        isConseillerNumerique: true,
      }),
    ).toBe('recapitulatif')
  })
})
