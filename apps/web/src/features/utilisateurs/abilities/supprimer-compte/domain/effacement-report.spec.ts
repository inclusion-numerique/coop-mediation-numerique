import {
  EffacementStep,
  ErasedCount,
  type effacementSteps,
  FailureReason,
  report,
} from './effacement-report'

type Step = (typeof effacementSteps)[number]

const erased = (step: Step, count = 3) =>
  ({
    _tag: 'erased',
    step: EffacementStep(step),
    count: ErasedCount(count),
  }) as const

const failed = (step: Step) =>
  ({
    _tag: 'failed',
    step: EffacementStep(step),
    cause: FailureReason('API injoignable'),
  }) as const

describe('report', () => {
  it('est complet quand aucune step n’a échoué', () => {
    expect(
      report([erased('PortefeuilleBeneficiaires'), erased('EmpreinteRdv')]),
    ).toEqual({
      _tag: 'complete',
      results: expect.any(Array),
    })
  })

  it('est complet quand une step est sans objet', () => {
    expect(
      report([{ _tag: 'skipped', step: EffacementStep('LieuxActivite') }])._tag,
    ).toBe('complete')
  })

  it('nomme les ports en échec quand il est partiel', () => {
    const result = report([
      erased('PortefeuilleBeneficiaires'),
      failed('ListesDeDiffusion'),
    ])

    expect(result._tag).toBe('partial')
    expect(result._tag === 'partial' && result.failed).toEqual([
      'ListesDeDiffusion',
    ])
  })
})
