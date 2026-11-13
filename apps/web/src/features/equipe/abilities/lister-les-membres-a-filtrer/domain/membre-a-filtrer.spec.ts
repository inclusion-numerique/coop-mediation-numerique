import { Email } from '../../../domain/email'
import { MediateurId } from '../../../domain/mediateur-id'
import { Nom } from '../../../domain/nom'
import { NomAffiche } from '../../../domain/nom-affiche'
import { Prenom } from '../../../domain/prenom'
import { type MembreLu, membresDansLOrdre } from './membre-a-filtrer'

const membre = (
  rang: number,
  prenom: string,
  nom: string,
  departs: readonly (Date | null)[],
): MembreLu => ({
  membre: {
    mediateurId: MediateurId(`0b3c4f62-2d6a-4f6e-9a39-3a4c8f1d2e0${rang}`),
    nom: NomAffiche(`${prenom} ${nom}`),
    email: Email(`${prenom.toLowerCase()}@example.com`),
  },
  prenom: Prenom(prenom),
  nomDeFamille: Nom(nom),
  departs,
})

describe('membres à filtrer', () => {
  it('place le demandeur, puis les membres par nom, puis les anciens', () => {
    const ordre = membresDansLOrdre(
      {
        mediateurId: MediateurId('9a8b7c6d-5e4f-4a3b-9c2d-1e0f9a8b7c6d'),
        nom: NomAffiche('Alan Turing'),
        email: Email('alan@example.com'),
      },
      [
        membre(1, 'Grace', 'hopper', [new Date('2026-03-06')]),
        membre(2, 'Ada', 'Lovelace', [null]),
        membre(3, 'Katherine', 'Johnson', [new Date('2026-01-01'), null]),
      ],
    )
    expect(ordre.map(({ nom, situation }) => `${nom} ${situation}`)).toEqual([
      'Alan Turing Demandeur',
      'Katherine Johnson Membre',
      'Ada Lovelace Membre',
      'Grace hopper AncienMembre',
    ])
  })
})
