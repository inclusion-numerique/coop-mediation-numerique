import {
  CoordinateurId,
  MediateurId,
  type RattachementsDuCompte,
} from '@app/web/features/utilisateurs/domain'
import { effacementPlan } from './effacement-plan'
import { EffacementStep } from './effacement-report'

const MEDIATEUR = MediateurId('1a2b3c4d-5e6f-4708-8192-a3b4c5d6e7f8')
const COORDINATEUR = CoordinateurId('2b3c4d5e-6f70-4819-92a3-b4c5d6e7f809')

const aucun: RattachementsDuCompte = { _tag: 'aucun' }
const mediateur: RattachementsDuCompte = {
  _tag: 'mediateur',
  mediateurId: MEDIATEUR,
}
const coordinateur: RattachementsDuCompte = {
  _tag: 'coordinateur',
  coordinateurId: COORDINATEUR,
}
const lesDeux: RattachementsDuCompte = {
  _tag: 'mediateurEtCoordinateur',
  mediateurId: MEDIATEUR,
  coordinateurId: COORDINATEUR,
}

describe('effacementPlan', () => {
  it("ne retient pour un compte sans rattachement que ce qui pend à l'utilisateur", () => {
    expect(effacementPlan(aucun)).toEqual(['EmpreinteRdv', 'ListesDeDiffusion'])
  })

  it('efface le portefeuille et les lieux pour un médiateur', () => {
    expect(effacementPlan(mediateur)).toContain('PortefeuilleBeneficiaires')
    expect(effacementPlan(mediateur)).toContain('LieuxActivite')
  })

  it("n'efface ni portefeuille ni lieux pour un coordinateur seul", () => {
    expect(effacementPlan(coordinateur)).not.toContain(
      'PortefeuilleBeneficiaires',
    )
    expect(effacementPlan(coordinateur)).not.toContain('LieuxActivite')
  })

  it('libère les équipes dès que le compte porte un rôle', () => {
    expect(effacementPlan(mediateur)).toContain('AppartenancesEquipe')
    expect(effacementPlan(coordinateur)).toContain('AppartenancesEquipe')
    expect(effacementPlan(aucun)).not.toContain('AppartenancesEquipe')
  })

  // L'invariant d'ordre : l'anonymisation du portefeuille détache `rdvUserId`,
  // et c'est elle qui rend les usagers RDV orphelins. Inversé, le balayage RDV
  // ne supprimerait rien — sans que rien ne le signale.
  it('anonymise le portefeuille AVANT de balayer RDV Service Public', () => {
    const plan = effacementPlan(lesDeux)

    expect(
      plan.indexOf(EffacementStep('PortefeuilleBeneficiaires')),
    ).toBeLessThan(plan.indexOf(EffacementStep('EmpreinteRdv')))
  })

  it('appelle les listes de diffusion en dernier', () => {
    const plan = effacementPlan(lesDeux)

    expect(plan.at(-1)).toBe('ListesDeDiffusion')
  })
})
