import { Thematique } from '@prisma/client'
import { clearAdministrativeData } from './clearAdministrativeData'

describe('clear administrative data', () => {
  it('removes all administrative thematiques when aide aux demarches administratives is absent', () => {
    const data = {
      thematiques: [Thematique.PapiersElectionsCitoyennete],
    }

    const clearedData = clearAdministrativeData(data)

    expect(clearedData).toStrictEqual({
      precisionsDemarche: null,
      thematiques: [],
    })
  })

  it('do not removes non administrative thematiques', () => {
    const data = {
      thematiques: [
        Thematique.PapiersElectionsCitoyennete,
        Thematique.Bureautique,
      ],
    }

    const clearedData = clearAdministrativeData(data)

    expect(clearedData).toStrictEqual({
      precisionsDemarche: null,
      thematiques: [Thematique.Bureautique],
    })
  })

  it('do not removes any thematique when thematiques contains aide aux demarches administratives', () => {
    const data = {
      thematiques: [
        Thematique.AideAuxDemarchesAdministratives,
        Thematique.PapiersElectionsCitoyennete,
        Thematique.Bureautique,
      ],
    }

    const clearedData = clearAdministrativeData(data)

    expect(clearedData).toStrictEqual({
      precisionsDemarche: undefined,
      thematiques: [
        Thematique.AideAuxDemarchesAdministratives,
        Thematique.PapiersElectionsCitoyennete,
        Thematique.Bureautique,
      ],
    })
  })

  it('removes precisions demarche when aide aux demarches administratives is absent', () => {
    const data = {
      precisionsDemarche: 'test',
      thematiques: [Thematique.PapiersElectionsCitoyennete],
    }

    const clearedData = clearAdministrativeData(data)

    expect(clearedData).toStrictEqual({
      precisionsDemarche: null,
      thematiques: [],
    })
  })

  it('do not removes precisions demarche when thematiques contains aide aux demarches administratives', () => {
    const data = {
      precisionsDemarche: 'test',
      thematiques: [Thematique.AideAuxDemarchesAdministratives],
    }

    const clearedData = clearAdministrativeData(data)

    expect(clearedData).toStrictEqual({
      precisionsDemarche: 'test',
      thematiques: [Thematique.AideAuxDemarchesAdministratives],
    })
  })
})
