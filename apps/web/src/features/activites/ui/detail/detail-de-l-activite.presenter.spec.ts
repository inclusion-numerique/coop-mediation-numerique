import { accompagnementSuivi, atelierMixte } from '../fixtures-de-consultation'
import { detailDeLActivite } from './detail-de-l-activite.presenter'

describe('détail d’une activité', () => {
  it('présente un accompagnement d’un bénéficiaire suivi, issu d’un rendez-vous', () => {
    expect(detailDeLActivite(accompagnementSuivi(), 'Europe/Paris')).toEqual({
      id: 'a0000000-0000-4000-8000-000000000001',
      segmentDeType: 'individuel',
      titre: 'Accompagnement individuel',
      jour: expect.any(String),
      duree: '1h30',
      lieu: '18000 Bourges',
      enregistreeLe: '03.03.2026 à 11h15',
      modifieeLe: null,
      beneficiaire: {
        _tag: 'Suivi',
        id: 'b0000000-0000-4000-8000-000000000001',
        nom: 'Camille Martin',
        activites: '1 activité',
      },
      participants: null,
      rendezVous: {
        libelle: 'Honoré',
        severite: 'success',
        lien: 'https://rdv.anct.gouv.fr/admin/rdvs/42',
      },
      rubriques: [
        {
          _tag: 'Liste',
          titre: 'Matériel utilisé',
          elements: ['Pas de matériel'],
        },
        {
          _tag: 'Liste',
          titre: 'Thématiques d’accompagnement',
          elements: expect.arrayContaining([expect.any(String)]),
        },
        { _tag: 'Liste', titre: 'Tag spécifique', elements: ['Réseau'] },
      ],
      demarche: [
        {
          _tag: 'Liste',
          titre: 'Thématique d’accompagnement',
          elements: [expect.any(String)],
        },
      ],
      notes: { titre: 'Notes sur l’accompagnement', html: '<p>Notes</p>' },
    })
  })

  it('décrit les participants d’un atelier mixte', () => {
    const { titre, participants, lieu, modifieeLe } = detailDeLActivite(
      atelierMixte(),
      'Europe/Paris',
    )
    expect({ titre, participants, lieu, modifieeLe }).toEqual({
      titre: 'Atelier collectif · Découvrir sa messagerie',
      lieu: 'À distance',
      modifieeLe: '04.03.2026 à 09h00',
      participants: {
        titre: '4 participants dont 1 bénéficiaire suivi et 3 anonymes',
        titreDesSuivis: '1 Participant suivi :',
        suivis: [
          { id: 'b0000000-0000-4000-8000-000000000001', nom: 'Camille Martin' },
        ],
        titreDesAnonymes: '3 Participants anonymes :',
        anonymes: [
          '2 nouveaux bénéficiaires, 1 bénéficiaire déjà accompagné',
          '1 homme, 2 femmes',
          '3 × de tranche d’âge non communiqué',
          '3 de statut social non communiqué ou hétérogène',
        ],
      },
    })
  })
})
