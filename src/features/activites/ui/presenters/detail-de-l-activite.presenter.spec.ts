import { describe, expect, it } from 'vitest'
import {
  type ActiviteConsultee,
  ActiviteId,
  aucuneParticipationAnonyme,
  BeneficiaireId,
  Commune,
  DateDActivite,
  DureeEnMinutes,
  Effectif,
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
} from '../../domain'
import { detailDeLActivite } from './detail-de-l-activite.presenter'

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

  it('présente un bénéficiaire suivi sans prénom par son seul nom', () => {
    const activite = accompagnementSuivi()
    expect(
      detailDeLActivite(
        {
          ...activite,
          affichage: {
            ...activite.affichage,
            suivis: activite.affichage.suivis.map((suivi) => ({
              ...suivi,
              prenom: null,
            })),
          },
        },
        'Europe/Paris',
      ).beneficiaire,
    ).toEqual({
      _tag: 'Suivi',
      id: 'b0000000-0000-4000-8000-000000000001',
      nom: 'Martin',
      activites: '1 activité',
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
