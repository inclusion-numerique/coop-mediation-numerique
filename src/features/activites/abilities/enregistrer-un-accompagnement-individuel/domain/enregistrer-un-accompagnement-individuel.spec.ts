import { describe, expect, it } from 'vitest'
import { failure, type Result, success } from '@/libraries/result'
import {
  type ActiviteDeMediationExistante,
  ActiviteId,
  ActiviteIntrouvable,
  BeneficiaireId,
  BeneficiaireIntrouvable,
  DateDActivite,
  DateTropLointaine,
  DureeEnMinutes,
  Genre,
  IdentifiantCraV1,
  LieuActiviteId,
  LieuInutilisable,
  MediateurId,
  RdvId,
  RendezVousIndisponible,
  StatutSocial,
  TagId,
  TagInutilisable,
  ThematiqueDeMediation,
  TrancheDAge,
  TypeDActivite,
  TypeDActiviteIncompatible,
} from '../../../domain'
import {
  type DependancesDeLAccompagnementIndividuel,
  type EchecDEnregistrement,
  enregistrerUnAccompagnementIndividuel,
} from './enregistrer-un-accompagnement-individuel'
import { ActionNonAutorisee } from './errors'
import type {
  AccompagnementEnregistre,
  SaisieIndividuelle,
} from './saisie-individuelle'

type Entree = {
  readonly saisie: SaisieIndividuelle
  readonly mediateurId: MediateurId | null
}

type Cas = {
  readonly cas: string
  readonly dependances: DependancesDeLAccompagnementIndividuel
  readonly entree: Entree
  readonly attendu: Result<AccompagnementEnregistre, EchecDEnregistrement>
}

const nouvelId = ActiviteId('a0000000-0000-4000-8000-000000000001')

const activiteModifiee = ActiviteId('a0000000-0000-4000-8000-000000000002')

const mediateurId = MediateurId('c0000000-0000-4000-8000-000000000001')

const lieuActiviteId = LieuActiviteId('d0000000-0000-4000-8000-000000000001')

const tagId = TagId('8f6b2c1e-0d3a-4c5e-9b7f-1a2b3c4d5e6f')

const suivi = BeneficiaireId('5b2d0c4e-8f1a-4c3b-9d7e-2a6f1b3c4d5e')

const existante: ActiviteDeMediationExistante = {
  type: TypeDActivite('Individuel'),
  creation: new Date('2026-11-01T08:00:00Z'),
  identifiantV1: null,
  precedente: {
    lieuActiviteId,
    suivis: [],
    anonymesOrphelins: [],
  },
}

const dependances: DependancesDeLAccompagnementIndividuel = {
  activiteDuMediateur: async () => existante,
  nouvelIdentifiant: () => nouvelId,
  beneficiaireDuMediateur: async () => ({ anonyme: false }),
  lieuUtilisable: async () => true,
  tagsUtilisables: async () => [],
  rendezVousDUnAutreMediateur: async () => false,
  rendezVousDejaSaisi: async () => false,
  employeuseDeLaDate: async () => null,
  creer: async () => undefined,
  modifier: async () => undefined,
  marquerLeRendezVousHonore: async () => undefined,
  maintenant: () => new Date('2026-11-10T08:00:00Z'),
}

const saisie: SaisieIndividuelle = {
  id: null,
  date: DateDActivite('2026-11-05'),
  duree: DureeEnMinutes(45),
  lieu: { _tag: 'ADistance' },
  thematiques: {
    mediation: [ThematiqueDeMediation('DiagnosticNumerique')],
    demarche: null,
  },
  equipement: { _tag: 'NonRenseigne' },
  tags: [],
  notes: null,
  rdvId: null,
  beneficiaire: {
    id: null,
    dejaAccompagne: true,
    profil: {
      genre: Genre('Feminin'),
      trancheDAge: TrancheDAge('VingtCinqTrenteNeuf'),
      statutSocial: StatutSocial('EnEmploi'),
      residence: null,
    },
  },
  autonomie: null,
  orientation: { _tag: 'NonRenseignee' },
}

const auLieuDActivite: SaisieIndividuelle = {
  ...saisie,
  lieu: { _tag: 'LieuActivite', lieuActiviteId },
}

const enModification: SaisieIndividuelle = { ...saisie, id: activiteModifiee }

const avecRendezVous: SaisieIndividuelle = { ...saisie, rdvId: RdvId(4) }

const avecSuivi: SaisieIndividuelle = {
  ...saisie,
  beneficiaire: { ...saisie.beneficiaire, id: suivi },
}

describe('enregistrer un accompagnement individuel', () => {
  it.each<Cas>([
    {
      cas: 'refuse un utilisateur qui n’est pas médiateur',
      dependances,
      entree: { saisie, mediateurId: null },
      attendu: failure(ActionNonAutorisee()),
    },
    {
      cas: 'refuse de modifier une activité introuvable chez le médiateur',
      dependances: { ...dependances, activiteDuMediateur: async () => null },
      entree: { saisie: enModification, mediateurId },
      attendu: failure(ActiviteIntrouvable()),
    },
    {
      cas: 'refuse de modifier un atelier collectif en accompagnement individuel',
      dependances: {
        ...dependances,
        activiteDuMediateur: async () => ({
          ...existante,
          type: TypeDActivite('Collectif'),
        }),
      },
      entree: { saisie: enModification, mediateurId },
      attendu: failure(TypeDActiviteIncompatible()),
    },
    {
      cas: 'refuse un bénéficiaire que le médiateur ne suit pas',
      dependances: {
        ...dependances,
        beneficiaireDuMediateur: async () => null,
      },
      entree: { saisie: avecSuivi, mediateurId },
      attendu: failure(BeneficiaireIntrouvable()),
    },
    {
      cas: 'refuse un lieu d’activité inutilisable à la création',
      dependances: { ...dependances, lieuUtilisable: async () => false },
      entree: { saisie: auLieuDActivite, mediateurId },
      attendu: failure(LieuInutilisable()),
    },
    {
      cas: 'refuse un lieu d’activité inutilisable à la modification',
      dependances: { ...dependances, lieuUtilisable: async () => false },
      entree: {
        saisie: { ...auLieuDActivite, id: activiteModifiee },
        mediateurId,
      },
      attendu: failure(LieuInutilisable()),
    },
    {
      cas: 'refuse un tag que le médiateur ne peut pas utiliser',
      dependances,
      entree: { saisie: { ...saisie, tags: [tagId] }, mediateurId },
      attendu: failure(TagInutilisable()),
    },
    {
      cas: 'refuse le rendez-vous d’un autre médiateur',
      dependances: {
        ...dependances,
        rendezVousDUnAutreMediateur: async () => true,
      },
      entree: { saisie: avecRendezVous, mediateurId },
      attendu: failure(RendezVousIndisponible()),
    },
    {
      cas: 'refuse un rendez-vous déjà saisi dans une autre activité',
      dependances: { ...dependances, rendezVousDejaSaisi: async () => true },
      entree: { saisie: avecRendezVous, mediateurId },
      attendu: failure(RendezVousIndisponible()),
    },
    {
      cas: 'refuse une date au-delà de deux ans',
      dependances,
      entree: {
        saisie: { ...saisie, date: DateDActivite('2029-01-01') },
        mediateurId,
      },
      attendu: failure(DateTropLointaine(DateDActivite('2028-11-10'))),
    },
    {
      cas: 'crée l’accompagnement sous un nouvel identifiant',
      dependances,
      entree: { saisie, mediateurId },
      attendu: success({ id: nouvelId, type: 'Individuel' }),
    },
    {
      cas: 'modifie l’accompagnement sous son identifiant',
      dependances,
      entree: { saisie: enModification, mediateurId },
      attendu: success({ id: activiteModifiee, type: 'Individuel' }),
    },
    {
      cas: 'modifie un accompagnement importé de la V1',
      dependances: {
        ...dependances,
        activiteDuMediateur: async () => ({
          ...existante,
          identifiantV1: IdentifiantCraV1('cra-v1'),
        }),
      },
      entree: { saisie: enModification, mediateurId },
      attendu: success({ id: activiteModifiee, type: 'Individuel' }),
    },
    {
      cas: 'enregistre l’accompagnement d’un bénéficiaire suivi',
      dependances,
      entree: { saisie: avecSuivi, mediateurId },
      attendu: success({ id: nouvelId, type: 'Individuel' }),
    },
    {
      cas: 'enregistre anonymement un bénéficiaire désigné mais anonyme',
      dependances: {
        ...dependances,
        beneficiaireDuMediateur: async () => ({ anonyme: true }),
      },
      entree: { saisie: avecSuivi, mediateurId },
      attendu: success({ id: nouvelId, type: 'Individuel' }),
    },
    {
      cas: 'enregistre l’accompagnement dans un lieu d’activité utilisable',
      dependances,
      entree: { saisie: auLieuDActivite, mediateurId },
      attendu: success({ id: nouvelId, type: 'Individuel' }),
    },
    {
      cas: 'enregistre l’accompagnement d’un rendez-vous disponible',
      dependances,
      entree: { saisie: avecRendezVous, mediateurId },
      attendu: success({ id: nouvelId, type: 'Individuel' }),
    },
  ])('$cas', async ({ dependances, entree, attendu }) => {
    expect(
      await enregistrerUnAccompagnementIndividuel(dependances)(entree),
    ).toEqual(attendu)
  })
})
