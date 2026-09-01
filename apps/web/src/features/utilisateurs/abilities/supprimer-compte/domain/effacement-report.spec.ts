import {
  EffacementStep,
  ErasedCount,
  type effacementSteps,
  FailureReason,
  failureReasonOf,
  isComplete,
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
  it('est complet quand aucune étape n’a échoué', () => {
    expect(
      report([erased('PortefeuilleBeneficiaires'), erased('EmpreinteRdv')]),
    ).toEqual({
      _tag: 'complete',
      results: expect.any(Array),
    })
  })

  it('est complet quand une étape est sans objet', () => {
    expect(
      report([{ _tag: 'skipped', step: EffacementStep('LieuxActivite') }])._tag,
    ).toBe('complete')
  })

  it('nomme les étapes en échec quand il est partiel', () => {
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

describe('cause d’un rejet', () => {
  it('retient le message d’une erreur', () => {
    expect(failureReasonOf(new Error('API injoignable'))).toBe(
      'API injoignable',
    )
  })

  it('accepte ce qui n’est pas une erreur', () => {
    expect(failureReasonOf('rupture de connexion')).toBe('rupture de connexion')
  })

  // Le modèle plafonne à 500 caractères : une trace non tronquée ferait échouer
  // le constructeur, donc l'effacement, pour un message trop long.
  it('tronque un message qui dépasse la longueur du modèle', () => {
    expect(failureReasonOf(new Error('x'.repeat(600)))).toHaveLength(500)
  })

  // Le modèle refuse le vide : sans repli, un rejet sans message ferait échouer
  // la construction du constat lui-même. Le repli couvre aussi bien une valeur
  // vide qu'une `Error` au message vide — les deux passent par le même `||`.
  it('se replie sur un texte quand le rejet n’en porte aucun', () => {
    expect(failureReasonOf('')).toBe('Erreur sans message')
  })
})

describe('constat complet', () => {
  it('est vrai quand aucune étape n’a échoué', () => {
    expect(isComplete(report([erased('EmpreinteRdv')]))).toBe(true)
  })

  it('est faux dès qu’une étape a échoué', () => {
    expect(isComplete(report([failed('ListesDeDiffusion')]))).toBe(false)
  })
})
