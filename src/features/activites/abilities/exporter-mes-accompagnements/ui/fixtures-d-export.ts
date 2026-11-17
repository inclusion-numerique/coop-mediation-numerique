import { CodeInsee } from '@app/web/libraries/insee'
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
} from '../../../domain'
import {
  type AccompagnementExporte,
  CodesPostaux,
  type CollectifExporte,
  type IndividuelExporte,
} from '../domain'

const AUCUNE_LOCALISATION = {
  commune: null,
  codesPostaux: null,
  codeInsee: null,
}

export const accompagnementDeMarie: AccompagnementExporte = {
  beneficiaire: { prenom: Prenom('Marie'), nom: NomDeFamille('Curie') },
  residence: {
    commune: NomDeCommune('Orléans'),
    codesPostaux: CodesPostaux('45100,45000'),
    codeInsee: CodeInsee('45234'),
  },
  genre: Genre('Feminin'),
  trancheDAge: TrancheDAge('SoixanteDixPlus'),
  statutSocial: StatutSocial('Retraite'),
  premierAccompagnement: true,
}

export const accompagnementAnonyme: AccompagnementExporte = {
  beneficiaire: { prenom: null, nom: null },
  residence: AUCUNE_LOCALISATION,
  genre: Genre('NonCommunique'),
  trancheDAge: TrancheDAge('NonCommunique'),
  statutSocial: StatutSocial('NonCommunique'),
  premierAccompagnement: false,
}

export const individuelExporte: IndividuelExporte = {
  _tag: 'Individuel',
  id: ActiviteId('0b9f1c2d-3e4f-4a5b-8c6d-7e8f9a0b1c2d'),
  date: DateDActivite('2026-03-09'),
  creation: new Date('2026-03-09T10:00:00.000Z'),
  modification: new Date('2026-03-09T10:00:00.000Z'),
  mediateur: {
    prenom: Prenom('Edith'),
    nom: NomDeFamille('Piaf'),
    conseillerNumerique: true,
  },
  typeDeLieu: TypeDeLieu('LieuActivite'),
  lieu: {
    nom: NomDeStructure('Médiathèque'),
    adresse: AdresseDuLieu('1 rue de la République'),
    commune: NomDeCommune('Lyon'),
    codesPostaux: CodesPostaux('69002'),
    codeInsee: CodeInsee('69382'),
  },
  duree: DureeEnMinutes(45),
  equipement: {
    _tag: 'Materiels',
    materiels: [Materiel('Ordinateur'), Materiel('Telephone')],
  },
  thematiques: [
    ThematiqueRecherchee('Email'),
    ThematiqueRecherchee('AideAuxDemarchesAdministratives'),
  ],
  tags: [NomDeTag('Rentrée'), NomDeTag('Quartier')],
  precisionDeDemarche: PrecisionDeDemarche('Carte grise'),
  notes: Notes('<p>Revenir avec le justificatif</p>'),
  source: SourceDeLActivite('Coop'),
  accompagnements: [accompagnementDeMarie],
  autonomie: Autonomie('PartiellementAutonome'),
  orientation: {
    _tag: 'Oriente',
    vers: StructureDeRedirection('Administration'),
  },
}

export const collectifExporte: CollectifExporte = {
  _tag: 'Collectif',
  id: ActiviteId('1c0a2d3e-4f5a-4b6c-9d7e-8f9a0b1c2d3e'),
  date: DateDActivite('2026-03-05'),
  creation: new Date('2026-03-05T08:30:00.000Z'),
  modification: new Date('2026-03-06T14:15:00.000Z'),
  mediateur: {
    prenom: Prenom('Georges'),
    nom: NomDeFamille('Moustaki'),
    conseillerNumerique: false,
  },
  typeDeLieu: TypeDeLieu('Autre'),
  lieu: {
    nom: null,
    adresse: null,
    commune: NomDeCommune('Villeurbanne'),
    codesPostaux: CodesPostaux('69100'),
    codeInsee: CodeInsee('69266'),
  },
  duree: DureeEnMinutes(120),
  equipement: { _tag: 'AucunMateriel' },
  thematiques: [ThematiqueRecherchee('ReseauxSociaux')],
  tags: [],
  precisionDeDemarche: null,
  notes: Notes('<p>Atelier complet</p>'),
  source: SourceDeLActivite('ImportV1'),
  accompagnements: [accompagnementDeMarie, accompagnementAnonyme],
  titre: TitreDAtelier('Découvrir les réseaux sociaux'),
  niveau: NiveauDAtelier('Debutant'),
}
