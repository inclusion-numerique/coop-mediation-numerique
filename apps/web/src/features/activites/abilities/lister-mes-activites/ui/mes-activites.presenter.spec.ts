import { NomAffiche } from '@app/web/libraries/nom-affiche'
import {
  Effectif,
  type ElementDeChronologie,
  LienAgent,
  RdvId,
  StatutDeRendezVous,
} from '../../../domain'
import {
  accompagnementSuivi,
  atelierMixte,
} from '../../../ui/fixtures-de-consultation'
import {
  joursDeLaListe,
  lignesDuTableau,
  titreDuDecompte,
} from './mes-activites.presenter'

const rendezVousDu = (debut: string): ElementDeChronologie => ({
  _tag: 'RendezVous',
  rendezVous: {
    id: RdvId(1),
    debut: new Date(debut),
    fin: new Date(debut),
    statut: StatutDeRendezVous('AVenir'),
    motif: null,
    titre: null,
    places: null,
    participants: [NomAffiche('Camille Martin')],
    lienAgent: LienAgent('https://rdv.anct.gouv.fr/admin/rdvs/1'),
  },
})

describe('page Mes activités', () => {
  it('regroupe les éléments par jour dans l’ordre reçu, dans le fuseau de l’utilisateur', () => {
    const jours = joursDeLaListe(
      [
        { _tag: 'Activite', activite: atelierMixte() },
        rendezVousDu('2026-03-04T23:30:00.000Z'),
        { _tag: 'Activite', activite: accompagnementSuivi() },
      ],
      'Europe/Paris',
    )
    expect(jours.map(({ cle, cartes }) => [cle, cartes.length])).toEqual([
      ['2026-03-05', 2],
      ['2026-03-03', 1],
    ])
  })

  it.each([
    [0, false, 'Aucune activité enregistrée'],
    [0, true, 'Aucune activité ne correspond à votre recherche'],
    [1, false, '1 activité enregistrée'],
    [3, false, '3 activités enregistrées'],
    [1, true, '1 activité correspond à votre recherche'],
    [3, true, '3 activités correspondent à votre recherche'],
  ])('décompte %i activité(s), filtrée : %s', (nombre, filtree, attendu) => {
    expect(titreDuDecompte(nombre, filtree)).toBe(attendu)
  })

  it('remplit une ligne du tableau par activité', () => {
    const lignes = lignesDuTableau(
      {
        elements: [
          { _tag: 'Activite', activite: atelierMixte() },
          rendezVousDu('2026-03-04T09:00:00.000Z'),
        ],
        total: {
          activites: Effectif(1),
          rendezVous: Effectif(1),
          accompagnements: Effectif(4),
        },
        pages: Effectif(1),
      },
      'Europe/Paris',
    )
    expect(
      lignes.map(({ type, personnes, jour, duree, lieu }) => ({
        type,
        personnes,
        jour,
        duree,
        lieu,
      })),
    ).toEqual([
      {
        type: 'Atelier collectif',
        personnes: '4 participants',
        jour: '05.03.2026',
        duree: '2h',
        lieu: '-',
      },
    ])
  })
})
