import { describe, expect, it } from 'vitest'
import { UsagerId } from '../../../domain/identifiants/usager-id'
import { creerOuFusionnerBeneficiaires } from './creer-ou-fusionner-beneficiaires'
import {
  type BeneficiaireFusionne,
  MediateurRedacteurId,
} from './rdv-pour-activite'

const fusionne: BeneficiaireFusionne = {
  id: '5d2f0a3e-1b4c-4d6e-8f9a-0b1c2d3e4f5a',
  prenom: 'Jean',
  nom: 'Dupont',
  email: null,
  telephone: null,
  mediateurId: 'b6f1a6a2-3c4d-4e5f-8a9b-0c1d2e3f4a5b',
  adresse: null,
  anneeNaissance: 1980,
  commune: null,
}

describe('creerOuFusionnerBeneficiaires', () => {
  it('rend les fiches créées ou rapprochées par la feature bénéficiaire', async () => {
    const beneficiaires = await creerOuFusionnerBeneficiaires(async () => ({
      merges: [fusionne],
      skipped: [],
    }))({
      usagers: [
        {
          id: UsagerId(200),
          prenom: 'Jean',
          nom: 'Dupont',
          email: null,
          telephone: null,
          adresse: null,
          dateNaissance: new Date('1980-05-04T00:00:00.000Z'),
        },
      ],
      mediateurId: MediateurRedacteurId('b6f1a6a2-3c4d-4e5f-8a9b-0c1d2e3f4a5b'),
    })

    expect(beneficiaires).toEqual([fusionne])
  })
})
