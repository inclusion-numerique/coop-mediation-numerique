import { describe, expect, it } from 'vitest'
import {
  type IssueDAuthentification,
  issueDAuthentification,
} from './issue-d-authentification'
import type { PeriodeDeValidite } from './periode-de-validite'
import { PorteeApi } from './portee-api'

const maintenant = new Date('2026-10-26T12:00:00Z')

const toujoursValide: PeriodeDeValidite = {
  debut: new Date('2026-01-01'),
  fin: null,
}

describe('issue de l’authentification d’un client API', () => {
  it('authentifie un client valide qui détient les portées demandées', () => {
    expect(
      issueDAuthentification(
        {
          portees: [PorteeApi('Activites'), PorteeApi('Structures')],
          validite: toujoursValide,
        },
        [PorteeApi('Activites')],
        maintenant,
      ),
    ).toBe('Authentifie')
  })

  it('n’autorise pas un client valide qui ne détient pas toutes les portées demandées', () => {
    expect(
      issueDAuthentification(
        { portees: [PorteeApi('Activites')], validite: toujoursValide },
        [PorteeApi('Activites'), PorteeApi('Statistiques')],
        maintenant,
      ),
    ).toBe('NonAutorise')
  })

  it.each<{
    cas: string
    validite: PeriodeDeValidite
    issue: IssueDAuthentification
  }>([
    {
      cas: 'commencée et pas encore finie',
      validite: { debut: new Date('2026-01-01'), fin: new Date('2026-12-31') },
      issue: 'Authentifie',
    },
    {
      cas: 'pas encore commencée',
      validite: { debut: new Date('2026-11-01'), fin: null },
      issue: 'NonAuthentifie',
    },
    {
      cas: 'finie',
      validite: { debut: new Date('2026-01-01'), fin: new Date('2026-06-30') },
      issue: 'NonAuthentifie',
    },
  ])(
    'juge l’authentification d’un client dont la validité est $cas',
    ({ validite, issue }) => {
      expect(
        issueDAuthentification(
          { portees: [PorteeApi('Activites')], validite },
          [PorteeApi('Activites')],
          maintenant,
        ),
      ).toBe(issue)
    },
  )
})
