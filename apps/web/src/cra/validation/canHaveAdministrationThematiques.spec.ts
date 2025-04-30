import { Thematique } from '@prisma/client'
import { canHaveAdministationThematiques } from './canHaveAdministrationThematiques'

describe('can have administration thematique is valid', () => {
  it('is invalid when thematiques contains administrative thematiques without aide aux demarches administratives', () => {
    const data = {
      thematiques: [Thematique.PapiersElectionsCitoyennete],
    }
    const result = canHaveAdministationThematiques(data)
    expect(result).toBe(false)
  })

  it('is valid when thematiques is empty', () => {
    const data = {
      thematiques: [],
    }
    const result = canHaveAdministationThematiques(data)
    expect(result).toBe(true)
  })

  it('is valid when thematiques contains non administrative thematiques', () => {
    const data = {
      thematiques: [Thematique.Bureautique],
    }
    const result = canHaveAdministationThematiques(data)
    expect(result).toBe(true)
  })

  it('is valid when thematiques contains administrative thematiques with aide aux demarches administratives', () => {
    const data = {
      thematiques: [
        Thematique.PapiersElectionsCitoyennete,
        Thematique.AideAuxDemarchesAdministratives,
      ],
    }
    const result = canHaveAdministationThematiques(data)
    expect(result).toBe(true)
  })
})
