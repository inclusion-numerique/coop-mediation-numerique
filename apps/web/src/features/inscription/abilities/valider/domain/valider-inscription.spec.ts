import { UserId } from '@app/web/features/inscription/domain'
import {
  type FaitsInscription,
  validerInscription,
} from './valider-inscription'

const userId = UserId('11111111-1111-1111-1111-111111111111')
const maintenant = new Date('2026-07-16T10:00:00.000Z')

const faits = (
  overrides: Partial<FaitsInscription> = {},
): FaitsInscription => ({
  userId,
  profilChoisi: true,
  compteDeRoleExiste: true,
  dejaValidee: false,
  cguDejaAcceptee: true,
  ...overrides,
})

describe('validerInscription', () => {
  it('refuse la validation sans profil choisi', () => {
    const resultat = validerInscription(
      faits({ profilChoisi: false }),
      maintenant,
    )

    expect(resultat).toEqual({
      success: false,
      error: { _tag: 'ProfilNonChoisi', userId },
    })
  })

  it('refuse la validation d’une inscription déjà validée', () => {
    const resultat = validerInscription(
      faits({ dejaValidee: true }),
      maintenant,
    )

    expect(resultat).toEqual({
      success: false,
      error: { _tag: 'InscriptionDejaValidee', userId },
    })
  })

  it('refuse la validation sans compte de rôle en base (garde anti-fantôme)', () => {
    const resultat = validerInscription(
      faits({ compteDeRoleExiste: false }),
      maintenant,
    )

    expect(resultat).toEqual({
      success: false,
      error: { _tag: 'CompteDeRoleIntrouvable', userId },
    })
  })

  it('valide et pose la date de validation, sans toucher aux CGU déjà acceptées', () => {
    const resultat = validerInscription(
      faits({ cguDejaAcceptee: true }),
      maintenant,
    )

    expect(resultat).toEqual({
      success: true,
      data: {
        aEnregistrer: { inscriptionValidee: maintenant, cguAPoser: null },
      },
    })
  })

  it('valide et pose les CGU quand elles n’avaient pas été acceptées (flow Dataspace)', () => {
    const resultat = validerInscription(
      faits({ cguDejaAcceptee: false }),
      maintenant,
    )

    expect(resultat).toEqual({
      success: true,
      data: {
        aEnregistrer: { inscriptionValidee: maintenant, cguAPoser: maintenant },
      },
    })
  })
})
