import { describe, expect, it } from 'vitest'
import {
  type ActiviteConsultee,
  ActiviteId,
  AdresseDuLieu,
  BeneficiaireId,
  Commune,
  DateDActivite,
  DureeEnMinutes,
  Effectif,
  LienAgent,
  LieuActiviteId,
  MediateurId,
  NomDeFamille,
  NomDeStructure,
  NomDeTag,
  Prenom,
  RdvId,
  StatutDeRendezVous,
  TagId,
  ThematiqueDeMediation,
} from '../../domain'
import {
  type ActiviteConsulteeRow,
  activiteConsulteeDe,
  rdvIdsDes,
} from './activite-consultee.transfer'
import type { RendezVousLieFourni } from './rendez-vous-fournis.transfer'

const instant = new Date('2026-11-10T09:00:00.000Z')

const suivi: ActiviteConsulteeRow['accompagnements'][number] = {
  premierAccompagnement: true,
  beneficiaire: {
    id: 'e0000000-0000-4000-8000-000000000001',
    anonyme: false,
    genre: null,
    trancheAge: null,
    statutSocial: null,
    commune: 'Reims',
    communeCodePostal: '51100',
    communeCodeInsee: '51454',
    prenom: 'Paul',
    nom: 'Durand',
    accompagnementsCount: 3,
  },
}

const ligne: ActiviteConsulteeRow = {
  id: 'b0000000-0000-4000-8000-000000000001',
  type: 'Individuel',
  mediateurId: 'c0000000-0000-4000-8000-000000000001',
  date: new Date('2026-11-10T00:00:00.000Z'),
  duree: 45,
  notes: null,
  rdvId: 4242,
  v1CraId: null,
  structureEmployeuseMainId: null,
  typeLieu: 'LieuActivite',
  structureId: 'd0000000-0000-4000-8000-000000000001',
  lieuCommune: null,
  lieuCodePostal: null,
  lieuCodeInsee: null,
  thematiques: ['Email'],
  precisionsDemarche: null,
  materiel: [],
  autonomie: null,
  orienteVersStructure: null,
  structureDeRedirection: null,
  titreAtelier: null,
  niveau: null,
  creation: instant,
  modification: instant,
  lieuInclusion: {
    id: 'd0000000-0000-4000-8000-000000000001',
    nom: 'Médiathèque de Reims',
    adresse: '2 rue des Fusiliers',
    codePostal: '51100',
    commune: 'Reims',
  },
  accompagnements: [suivi],
  tags: [
    {
      tagId: 'f0000000-0000-4000-8000-000000000001',
      tag: {
        id: 'f0000000-0000-4000-8000-000000000001',
        nom: 'Numérique en famille',
      },
    },
  ],
}

const rendezVous: RendezVousLieFourni = {
  id: 4242,
  statut: 'seen',
  lienAgent: 'https://rdv.anct.gouv.fr/admin/rdvs/4242',
}

describe('activité consultée lue en base', () => {
  it('lit une activité issue d’un rendez-vous, avec son lieu, ses suivis et ses tags', () => {
    expect(activiteConsulteeDe(ligne, [rendezVous])).toEqual({
      activite: {
        _tag: 'Individuel',
        id: ActiviteId('b0000000-0000-4000-8000-000000000001'),
        mediateurId: MediateurId('c0000000-0000-4000-8000-000000000001'),
        date: DateDActivite('2026-11-10'),
        duree: DureeEnMinutes(45),
        lieu: {
          _tag: 'LieuActivite',
          lieuActiviteId: LieuActiviteId(
            'd0000000-0000-4000-8000-000000000001',
          ),
        },
        thematiques: {
          mediation: [ThematiqueDeMediation('Email')],
          demarche: null,
        },
        equipement: { _tag: 'NonRenseigne' },
        tags: [TagId('f0000000-0000-4000-8000-000000000001')],
        notes: null,
        origine: { _tag: 'RendezVous', rdvId: RdvId(4242) },
        employeuse: null,
        creation: instant,
        modification: instant,
        beneficiaire: {
          _tag: 'Suivi',
          id: BeneficiaireId('e0000000-0000-4000-8000-000000000001'),
        },
        autonomie: null,
        orientation: { _tag: 'NonRenseignee' },
      },
      affichage: {
        lieu: {
          id: LieuActiviteId('d0000000-0000-4000-8000-000000000001'),
          nom: NomDeStructure('Médiathèque de Reims'),
          adresse: AdresseDuLieu('2 rue des Fusiliers, 51100 Reims'),
          localite: AdresseDuLieu('51100 Reims'),
        },
        suivis: [
          {
            id: BeneficiaireId('e0000000-0000-4000-8000-000000000001'),
            prenom: Prenom('Paul'),
            nom: NomDeFamille('Durand'),
            residence: Commune({
              nom: 'Reims',
              codePostal: '51100',
              codeInsee: '51454',
            }),
            nombreDActivites: Effectif(3),
          },
        ],
        tags: [
          {
            id: TagId('f0000000-0000-4000-8000-000000000001'),
            nom: NomDeTag('Numérique en famille'),
          },
        ],
        rendezVous: {
          statut: StatutDeRendezVous('Honore'),
          lienAgent: LienAgent('https://rdv.anct.gouv.fr/admin/rdvs/4242'),
        },
      },
    } satisfies ActiviteConsultee)
  })

  it('n’affiche pas un bénéficiaire anonyme parmi les suivis', () => {
    expect(
      activiteConsulteeDe(
        {
          ...ligne,
          accompagnements: [
            {
              ...suivi,
              beneficiaire: { ...suivi.beneficiaire, anonyme: true },
            },
          ],
        },
        [rendezVous],
      ).affichage.suivis,
    ).toEqual([])
  })

  it('n’affiche aucun lieu hors lieu d’activité', () => {
    expect(
      activiteConsulteeDe(
        {
          ...ligne,
          typeLieu: 'ADistance',
          structureId: null,
          lieuInclusion: null,
        },
        [rendezVous],
      ).affichage.lieu,
    ).toBeNull()
  })

  it('n’affiche que la localité d’un lieu sans voie', () => {
    expect(
      activiteConsulteeDe(
        {
          ...ligne,
          lieuInclusion: {
            id: 'd0000000-0000-4000-8000-000000000001',
            nom: 'Médiathèque de Reims',
            adresse: '',
            codePostal: '51100',
            commune: 'Reims',
          },
        },
        [rendezVous],
      ).affichage.lieu,
    ).toEqual({
      id: LieuActiviteId('d0000000-0000-4000-8000-000000000001'),
      nom: NomDeStructure('Médiathèque de Reims'),
      adresse: null,
      localite: AdresseDuLieu('51100 Reims'),
    })
  })

  it.each<[string, ActiviteConsulteeRow, readonly RendezVousLieFourni[]]>([
    ['un rendez-vous non fourni', ligne, []],
    ['une activité saisie', { ...ligne, rdvId: null }, [rendezVous]],
  ])('n’affiche aucun rendez-vous pour %s', (_, consultee, fournis) => {
    expect(
      activiteConsulteeDe(consultee, fournis).affichage.rendezVous,
    ).toBeNull()
  })

  it('lit un suivi sans prénom, pour l’afficher par son seul nom', () => {
    expect(
      activiteConsulteeDe(
        {
          ...ligne,
          accompagnements: [
            { ...suivi, beneficiaire: { ...suivi.beneficiaire, prenom: null } },
          ],
        },
        [],
      ).affichage.suivis.at(0)?.prenom,
    ).toBeNull()
  })

  it.each<[string, ActiviteConsulteeRow]>([
    ['une activité illisible', { ...ligne, id: 'pas-un-identifiant' }],
  ])('rejette %s', (_, illisible) => {
    expect(() => activiteConsulteeDe(illisible, [])).toThrow()
  })
})

describe('rendez-vous des activités consultées', () => {
  it('ne retient que les activités issues d’un rendez-vous', () => {
    expect(
      rdvIdsDes([ligne, { ...ligne, rdvId: null }, { ...ligne, rdvId: 7 }]),
    ).toEqual([4242, 7])
  })
})
