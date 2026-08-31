import {
  CoordinateurId,
  MediateurId,
  type RattachementsDuCompte,
} from '@app/web/features/utilisateurs/domain'
import { NomCharge } from './constat-effacement'
import { planEffacement } from './plan-effacement'

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

describe('planEffacement', () => {
  it("ne retient pour un compte sans rattachement que ce qui pend à l'utilisateur", () => {
    expect(planEffacement(aucun)).toEqual(['EmpreinteRdv', 'ListesDeDiffusion'])
  })

  it('efface le portefeuille et les lieux pour un médiateur', () => {
    expect(planEffacement(mediateur)).toContain('PortefeuilleBeneficiaires')
    expect(planEffacement(mediateur)).toContain('LieuxActivite')
  })

  it("n'efface ni portefeuille ni lieux pour un coordinateur seul", () => {
    expect(planEffacement(coordinateur)).not.toContain(
      'PortefeuilleBeneficiaires',
    )
    expect(planEffacement(coordinateur)).not.toContain('LieuxActivite')
  })

  it('libère les équipes dès que le compte porte un rôle', () => {
    expect(planEffacement(mediateur)).toContain('AppartenancesEquipe')
    expect(planEffacement(coordinateur)).toContain('AppartenancesEquipe')
    expect(planEffacement(aucun)).not.toContain('AppartenancesEquipe')
  })

  // L'invariant d'ordre : l'anonymisation du portefeuille détache `rdvUserId`,
  // et c'est elle qui rend les usagers RDV orphelins. Inversé, le balayage RDV
  // ne supprimerait rien — sans que rien ne le signale.
  it('anonymise le portefeuille AVANT de balayer RDV Service Public', () => {
    const plan = planEffacement(lesDeux)

    expect(plan.indexOf(NomCharge('PortefeuilleBeneficiaires'))).toBeLessThan(
      plan.indexOf(NomCharge('EmpreinteRdv')),
    )
  })

  it('appelle les listes de diffusion en dernier', () => {
    const plan = planEffacement(lesDeux)

    expect(plan.at(-1)).toBe('ListesDeDiffusion')
  })
})
