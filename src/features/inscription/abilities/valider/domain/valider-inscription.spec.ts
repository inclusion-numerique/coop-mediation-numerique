import { describe, expect, it } from 'vitest'
import { UtilisateurId } from '@/features/inscription/domain'
import {
  type FaitsInscription,
  validerInscription,
} from './valider-inscription'

const userId = UtilisateurId('11111111-1111-1111-1111-111111111111')
const maintenant = new Date('2026-07-16T10:00:00.000Z')

const inscriptionValidable: FaitsInscription = {
  userId,
  profilChoisi: true,
  compteDeRoleExiste: true,
  dejaValidee: false,
  cguDejaAcceptee: true,
}

describe('validerInscription', () => {
  it('valide et pose la date de validation, sans toucher aux CGU déjà acceptées', () => {
    expect(validerInscription(inscriptionValidable, maintenant)).toEqual({
      success: true,
      data: {
        aEnregistrer: { inscriptionValidee: maintenant, cguAPoser: null },
      },
    })
  })

  it('valide et pose les CGU quand elles n’avaient pas été acceptées (flow Dataspace)', () => {
    expect(
      validerInscription(
        { ...inscriptionValidable, cguDejaAcceptee: false },
        maintenant,
      ),
    ).toEqual({
      success: true,
      data: {
        aEnregistrer: { inscriptionValidee: maintenant, cguAPoser: maintenant },
      },
    })
  })
})
