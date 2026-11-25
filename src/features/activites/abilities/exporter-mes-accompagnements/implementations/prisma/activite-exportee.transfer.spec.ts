import { describe, expect, it } from 'vitest'
import { CodeInsee } from '@/libraries/insee'
import {
  ActiviteId,
  AdresseDuLieu,
  Autonomie,
  DateDActivite,
  DureeEnMinutes,
  Genre,
  Materiel,
  NiveauDAtelier,
  NomDeCommune,
  NomDeFamille,
  NomDeStructure,
  NomDeTag,
  Notes,
  PrecisionDeDemarche,
  Prenom,
  SourceDeLActivite,
  StatutSocial,
  StructureDeRedirection,
  ThematiqueRecherchee,
  TitreDAtelier,
  TrancheDAge,
  TypeDeLieu,
} from '../../../../domain'
import {
  type AccompagnementExporte,
  type ActiviteExportee,
  CodesPostaux,
  type IndividuelExporte,
} from '../../domain'
import {
  type ActiviteExporteeRow,
  activiteExporteeDe,
} from './activite-exportee.transfer'

const creation = new Date('2026-11-10T09:00:00.000Z')
const modification = new Date('2026-11-12T09:00:00.000Z')

const beneficiaireInconnu: ActiviteExporteeRow['accompagnements'][number] = {
  premierAccompagnement: false,
  beneficiaire: {
    prenom: null,
    nom: null,
    commune: null,
    communeCodePostal: null,
    communeCodeInsee: null,
    genre: null,
    trancheAge: null,
    statutSocial: null,
  },
}

const individuel: ActiviteExporteeRow = {
  id: 'b0000000-0000-4000-8000-000000000001',
  type: 'Individuel',
  date: new Date('2026-11-10T00:00:00.000Z'),
  creation,
  modification,
  typeLieu: 'LieuActivite',
  duree: 45,
  materiel: ['Ordinateur', 'Telephone'],
  thematiques: ['Email', 'Logement'],
  precisionsDemarche: 'Demande d’APL',
  notes: '<p>Prochain rendez-vous dans un mois</p>',
  v1CraId: null,
  autonomie: 'PartiellementAutonome',
  orienteVersStructure: true,
  structureDeRedirection: 'AideSociale',
  titreAtelier: null,
  niveau: null,
  lieuCommune: null,
  lieuCodePostal: null,
  lieuCodeInsee: null,
  lieuInclusion: {
    nom: 'Médiathèque de Reims',
    adresse: '2 rue des Fusiliers',
    commune: 'Reims',
    codePostal: '51100',
    codeInsee: '51454',
  },
  tags: [{ tag: { nom: 'Numérique en famille' } }, { tag: { nom: '  ' } }],
  mediateur: { user: { firstName: 'Jeanne', lastName: 'Martin' } },
  accompagnements: [
    {
      premierAccompagnement: true,
      beneficiaire: {
        prenom: 'Paul',
        nom: 'Durand',
        commune: 'Reims',
        communeCodePostal: '51100',
        communeCodeInsee: '51454',
        genre: 'Masculin',
        trancheAge: 'SoixanteSoixanteNeuf',
        statutSocial: 'Retraite',
      },
    },
  ],
}

const collectif: ActiviteExporteeRow = {
  ...individuel,
  type: 'Collectif',
  typeLieu: 'Autre',
  materiel: ['Aucun'],
  thematiques: ['ReseauxSociaux'],
  precisionsDemarche: null,
  notes: null,
  v1CraId: 'cra-v1-1',
  autonomie: null,
  orienteVersStructure: null,
  structureDeRedirection: null,
  titreAtelier: 'Atelier réseaux sociaux',
  niveau: 'Debutant',
  lieuCommune: 'Châlons-en-Champagne',
  lieuCodePostal: '51000',
  lieuCodeInsee: '51108',
  lieuInclusion: null,
  tags: [],
  mediateur: { user: { firstName: null, lastName: null } },
  accompagnements: [beneficiaireInconnu],
}

const accompagnementInconnu: AccompagnementExporte = {
  beneficiaire: { prenom: null, nom: null },
  residence: { commune: null, codesPostaux: null, codeInsee: null },
  genre: Genre('NonCommunique'),
  trancheDAge: TrancheDAge('NonCommunique'),
  statutSocial: StatutSocial('NonCommunique'),
  premierAccompagnement: false,
}

describe('activité exportée lue en base', () => {
  it('lit un accompagnement individuel dans un lieu d’activité', () => {
    expect(activiteExporteeDe(individuel, true)).toEqual({
      _tag: 'Individuel',
      id: ActiviteId('b0000000-0000-4000-8000-000000000001'),
      date: DateDActivite('2026-11-10'),
      creation,
      modification,
      mediateur: {
        prenom: Prenom('Jeanne'),
        nom: NomDeFamille('Martin'),
        conseillerNumerique: true,
      },
      typeDeLieu: TypeDeLieu('LieuActivite'),
      lieu: {
        nom: NomDeStructure('Médiathèque de Reims'),
        adresse: AdresseDuLieu('2 rue des Fusiliers'),
        commune: NomDeCommune('Reims'),
        codesPostaux: CodesPostaux('51100'),
        codeInsee: CodeInsee('51454'),
      },
      duree: DureeEnMinutes(45),
      equipement: {
        _tag: 'Materiels',
        materiels: [Materiel('Ordinateur'), Materiel('Telephone')],
      },
      thematiques: [
        ThematiqueRecherchee('Email'),
        ThematiqueRecherchee('Logement'),
      ],
      tags: [NomDeTag('Numérique en famille')],
      precisionDeDemarche: PrecisionDeDemarche('Demande d’APL'),
      notes: Notes('<p>Prochain rendez-vous dans un mois</p>'),
      source: SourceDeLActivite('Coop'),
      accompagnements: [
        {
          beneficiaire: { prenom: Prenom('Paul'), nom: NomDeFamille('Durand') },
          residence: {
            commune: NomDeCommune('Reims'),
            codesPostaux: CodesPostaux('51100'),
            codeInsee: CodeInsee('51454'),
          },
          genre: Genre('Masculin'),
          trancheDAge: TrancheDAge('SoixanteSoixanteNeuf'),
          statutSocial: StatutSocial('Retraite'),
          premierAccompagnement: true,
        },
      ],
      autonomie: Autonomie('PartiellementAutonome'),
      orientation: {
        _tag: 'Oriente',
        vers: StructureDeRedirection('AideSociale'),
      },
    } satisfies ActiviteExportee)
  })

  it('lit un atelier importé de la V1 hors lieu d’activité', () => {
    expect(activiteExporteeDe(collectif, false)).toEqual({
      _tag: 'Collectif',
      id: ActiviteId('b0000000-0000-4000-8000-000000000001'),
      date: DateDActivite('2026-11-10'),
      creation,
      modification,
      mediateur: { prenom: null, nom: null, conseillerNumerique: false },
      typeDeLieu: TypeDeLieu('Autre'),
      lieu: {
        nom: null,
        adresse: null,
        commune: NomDeCommune('Châlons-en-Champagne'),
        codesPostaux: CodesPostaux('51000'),
        codeInsee: CodeInsee('51108'),
      },
      duree: DureeEnMinutes(45),
      equipement: { _tag: 'AucunMateriel' },
      thematiques: [ThematiqueRecherchee('ReseauxSociaux')],
      tags: [],
      precisionDeDemarche: null,
      notes: null,
      source: SourceDeLActivite('ImportV1'),
      accompagnements: [accompagnementInconnu],
      titre: TitreDAtelier('Atelier réseaux sociaux'),
      niveau: NiveauDAtelier('Debutant'),
    } satisfies ActiviteExportee)
  })

  it.each<
    [string, Partial<ActiviteExporteeRow>, IndividuelExporte['orientation']]
  >([
    [
      'non renseignée',
      { orienteVersStructure: null },
      { _tag: 'NonRenseignee' },
    ],
    ['refusée', { orienteVersStructure: false }, { _tag: 'NonOriente' }],
    [
      'sans structure précisée',
      { orienteVersStructure: true, structureDeRedirection: null },
      { _tag: 'Oriente', vers: null },
    ],
  ])('lit une orientation %s', (_, colonnes, orientation) => {
    expect(
      activiteExporteeDe({ ...individuel, ...colonnes }, true),
    ).toMatchObject({ orientation })
  })

  it('lit l’absence de matériel renseigné', () => {
    expect(
      activiteExporteeDe({ ...individuel, materiel: [] }, true).equipement,
    ).toEqual({ _tag: 'NonRenseigne' })
  })

  it('lit comme absentes les localisations et identités illisibles', () => {
    expect(
      activiteExporteeDe(
        {
          ...collectif,
          accompagnements: [
            {
              ...beneficiaireInconnu,
              beneficiaire: {
                ...beneficiaireInconnu.beneficiaire,
                prenom: '  ',
                nom: '',
                commune: ' ',
                communeCodePostal: '51',
                communeCodeInsee: '999',
              },
            },
          ],
        },
        false,
      ).accompagnements,
    ).toEqual([accompagnementInconnu])
  })

  it.each<[string, ActiviteExporteeRow]>([
    ['un identifiant', { ...individuel, id: 'pas-un-identifiant' }],
    ['une durée', { ...individuel, duree: -1 }],
  ])('rejette %s illisible', (_, ligne) => {
    expect(() => activiteExporteeDe(ligne, true)).toThrow()
  })
})
