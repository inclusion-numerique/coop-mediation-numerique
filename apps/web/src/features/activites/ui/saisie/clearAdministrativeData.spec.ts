import { clearAdministrativeData } from '@app/web/features/activites/ui/saisie/clearAdministrativeData'

describe('clear administrative data', () => {
  it('removes all administrative thematiques when aide aux demarches administratives is absent', () => {
    const data = {
      thematiques: ['PapiersElectionsCitoyennete' as const],
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
        'PapiersElectionsCitoyennete' as const,
        'Bureautique' as const,
      ],
    }

    const clearedData = clearAdministrativeData(data)

    expect(clearedData).toStrictEqual({
      precisionsDemarche: null,
      thematiques: ['Bureautique' as const],
    })
  })

  it('do not removes any thematique when thematiques contains aide aux demarches administratives', () => {
    const data = {
      thematiques: [
        'AideAuxDemarchesAdministratives' as const,
        'PapiersElectionsCitoyennete' as const,
        'Bureautique' as const,
      ],
    }

    const clearedData = clearAdministrativeData(data)

    expect(clearedData).toStrictEqual({
      precisionsDemarche: undefined,
      thematiques: [
        'AideAuxDemarchesAdministratives' as const,
        'PapiersElectionsCitoyennete' as const,
        'Bureautique' as const,
      ],
    })
  })

  it('removes precisions demarche when aide aux demarches administratives is absent', () => {
    const data = {
      precisionsDemarche: 'test',
      thematiques: ['PapiersElectionsCitoyennete' as const],
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
      thematiques: ['AideAuxDemarchesAdministratives' as const],
    }

    const clearedData = clearAdministrativeData(data)

    expect(clearedData).toStrictEqual({
      precisionsDemarche: 'test',
      thematiques: ['AideAuxDemarchesAdministratives' as const],
    })
  })
})
