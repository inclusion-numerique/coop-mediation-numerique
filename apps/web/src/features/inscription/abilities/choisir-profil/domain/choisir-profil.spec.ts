import { ProfilInscription } from '@app/web/features/inscription/domain/profil-inscription'
import { rolesACreerPourProfil } from './choisir-profil'

describe('rolesACreerPourProfil', () => {
  it('un médiateur garantit un compte médiateur seul', () => {
    expect(rolesACreerPourProfil(ProfilInscription('Mediateur'))).toEqual({
      mediateur: true,
      coordinateur: false,
    })
  })

  it('un coordinateur garantit un compte coordinateur seul', () => {
    expect(rolesACreerPourProfil(ProfilInscription('Coordinateur'))).toEqual({
      mediateur: false,
      coordinateur: true,
    })
  })

  it('un conseiller numérique garantit un compte médiateur', () => {
    expect(
      rolesACreerPourProfil(ProfilInscription('ConseillerNumerique')),
    ).toEqual({ mediateur: true, coordinateur: false })
  })

  it('un coordinateur conseiller numérique garantit un compte coordinateur', () => {
    expect(
      rolesACreerPourProfil(
        ProfilInscription('CoordinateurConseillerNumerique'),
      ),
    ).toEqual({ mediateur: false, coordinateur: true })
  })
})
