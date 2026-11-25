import { describe, expect, it } from 'vitest'
import { NomAffiche } from '@/libraries/nom-affiche'
import {
  type ActiviteConsultee,
  ActiviteId,
  aucuneParticipationAnonyme,
  BeneficiaireId,
  Commune,
  DateDActivite,
  DureeEnMinutes,
  Effectif,
  type ElementDeChronologie,
  LienAgent,
  MediateurId,
  NomDeFamille,
  NomDeTag,
  Notes,
  Prenom,
  participantsAnonymesDe,
  RdvId,
  StatutDeRendezVous,
  TagId,
  ThematiqueAdministrative,
  ThematiqueDeMediation,
  TitreDAtelier,
} from '../../../../domain'
import {
  joursDeLaListe,
  lignesDuTableau,
  titreDuDecompte,
} from './mes-activites.presenter'

const instant = new Date('2026-03-03T10:15:00.000Z')
const suivi = BeneficiaireId('b0000000-0000-4000-8000-000000000001')

const anonymes = participantsAnonymesDe({
  ...aucuneParticipationAnonyme,
  total: Effectif(3),
  dejaAccompagnes: Effectif(1),
  genres: { masculin: Effectif(1), feminin: Effectif(2) },
})

const accompagnementSuivi = (): ActiviteConsultee => ({
  activite: {
    _tag: 'Individuel',
    id: ActiviteId('a0000000-0000-4000-8000-000000000001'),
    mediateurId: MediateurId('c0000000-0000-4000-8000-000000000001'),
    date: DateDActivite('2026-03-03'),
    duree: DureeEnMinutes(90),
    lieu: {
      _tag: 'Domicile',
      commune: Commune({
        nom: 'Bourges',
        codePostal: '18000',
        codeInsee: '18033',
      }),
    },
    thematiques: {
      mediation: [
        ThematiqueDeMediation('Email'),
        ThematiqueDeMediation('Sante'),
      ],
      demarche: {
        thematiques: [ThematiqueAdministrative('SocialSante')],
        precision: null,
      },
    },
    equipement: { _tag: 'AucunMateriel' },
    tags: [TagId('d0000000-0000-4000-8000-000000000001')],
    notes: Notes('<p>Notes</p>'),
    origine: { _tag: 'RendezVous', rdvId: RdvId(42) },
    employeuse: null,
    creation: instant,
    modification: instant,
    beneficiaire: { _tag: 'Suivi', id: suivi },
    autonomie: null,
    orientation: { _tag: 'NonRenseignee' },
  },
  affichage: {
    lieu: null,
    suivis: [
      {
        id: suivi,
        prenom: Prenom('Camille'),
        nom: NomDeFamille('Martin'),
        residence: null,
        nombreDActivites: Effectif(1),
      },
    ],
    tags: [
      {
        id: TagId('d0000000-0000-4000-8000-000000000001'),
        nom: NomDeTag('Réseau'),
      },
    ],
    rendezVous: {
      statut: StatutDeRendezVous('Honore'),
      lienAgent: LienAgent('https://rdv.anct.gouv.fr/admin/rdvs/42'),
    },
  },
})

const atelierMixte = (): ActiviteConsultee => {
  if (!anonymes.success) throw new Error(anonymes.error._tag)
  return {
    activite: {
      _tag: 'Collectif',
      id: ActiviteId('a0000000-0000-4000-8000-000000000002'),
      mediateurId: MediateurId('c0000000-0000-4000-8000-000000000001'),
      date: DateDActivite('2026-03-05'),
      duree: DureeEnMinutes(120),
      lieu: { _tag: 'ADistance', communeDeRattachement: null },
      thematiques: {
        mediation: [ThematiqueDeMediation('Email')],
        demarche: null,
      },
      equipement: { _tag: 'NonRenseigne' },
      tags: [],
      notes: null,
      origine: { _tag: 'Saisie' },
      employeuse: null,
      creation: instant,
      modification: new Date('2026-03-04T08:00:00.000Z'),
      titre: TitreDAtelier('Découvrir sa messagerie'),
      niveau: null,
      participants: { suivis: [suivi], anonymes: anonymes.data },
    },
    affichage: {
      lieu: null,
      suivis: accompagnementSuivi().affichage.suivis,
      tags: [],
      rendezVous: null,
    },
  }
}

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
