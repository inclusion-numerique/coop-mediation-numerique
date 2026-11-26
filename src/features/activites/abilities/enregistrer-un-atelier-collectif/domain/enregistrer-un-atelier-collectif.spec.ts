import { describe, expect, it } from 'vitest'
import { failure, type Result, success } from '@/libraries/result'
import {
  type ActiviteDeMediationExistante,
  ActiviteId,
  ActiviteIntrouvable,
  AtelierSansParticipant,
  BeneficiaireEnDouble,
  BeneficiaireId,
  BeneficiaireIntrouvable,
  DateDActivite,
  DateTropLointaine,
  DureeEnMinutes,
  Effectif,
  LieuActiviteId,
  LieuInutilisable,
  MediateurId,
  type ParticipantsAnonymes,
  RdvId,
  RendezVousIndisponible,
  TagId,
  TagInutilisable,
  ThematiqueDeMediation,
  TypeDActivite,
  TypeDActiviteIncompatible,
} from '../../../domain'
import {
  type DependancesDeLAtelierCollectif,
  type EchecDEnregistrement,
  enregistrerUnAtelierCollectif,
} from './enregistrer-un-atelier-collectif'
import { ActionNonAutorisee } from './errors'
import type { AtelierEnregistre, SaisieCollective } from './saisie-collective'

type Entree = {
  readonly saisie: SaisieCollective
  readonly mediateurId: MediateurId | null
}

type Cas = {
  readonly cas: string
  readonly dependances: DependancesDeLAtelierCollectif
  readonly entree: Entree
  readonly attendu: Result<AtelierEnregistre, EchecDEnregistrement>
}

const nouvelId = ActiviteId('a0000000-0000-4000-8000-000000000001')

const activiteModifiee = ActiviteId('a0000000-0000-4000-8000-000000000002')

const mediateurId = MediateurId('c0000000-0000-4000-8000-000000000001')

const suivi = BeneficiaireId('5b2d0c4e-8f1a-4c3b-9d7e-2a6f1b3c4d5e')

const sansAnonyme: ParticipantsAnonymes = {
  total: Effectif(0),
  dejaAccompagnes: Effectif(0),
  genres: {
    masculin: Effectif(0),
    feminin: Effectif(0),
    nonCommunique: Effectif(0),
  },
  tranchesDAge: {
    moinsDeDouze: Effectif(0),
    douzeDixHuit: Effectif(0),
    dixHuitVingtQuatre: Effectif(0),
    vingtCinqTrenteNeuf: Effectif(0),
    quaranteCinquanteNeuf: Effectif(0),
    soixanteSoixanteNeuf: Effectif(0),
    soixanteDixPlus: Effectif(0),
    nonCommunique: Effectif(0),
  },
  statutsSociaux: {
    scolarise: Effectif(0),
    sansEmploi: Effectif(0),
    enEmploi: Effectif(0),
    retraite: Effectif(0),
    nonCommunique: Effectif(0),
  },
}

const existante: ActiviteDeMediationExistante = {
  type: TypeDActivite('Collectif'),
  creation: new Date('2026-11-01T08:00:00Z'),
  identifiantV1: null,
  precedente: { lieuActiviteId: null, suivis: [], anonymesOrphelins: [] },
}

const dependances: DependancesDeLAtelierCollectif = {
  activiteDuMediateur: async () => existante,
  nouvelIdentifiant: () => nouvelId,
  nombreDeSuivisDuMediateur: async () => 1,
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

const saisie: SaisieCollective = {
  id: null,
  date: DateDActivite('2026-11-05'),
  duree: DureeEnMinutes(90),
  lieu: {
    _tag: 'LieuActivite',
    lieuActiviteId: LieuActiviteId('d0000000-0000-4000-8000-000000000001'),
  },
  thematiques: {
    mediation: [ThematiqueDeMediation('DiagnosticNumerique')],
    demarche: null,
  },
  equipement: { _tag: 'AucunMateriel' },
  tags: [],
  notes: null,
  rdvId: null,
  titre: null,
  niveau: null,
  suivis: [suivi],
  anonymes: sansAnonyme,
}

const enModification: SaisieCollective = { ...saisie, id: activiteModifiee }

const avecRendezVous: SaisieCollective = { ...saisie, rdvId: RdvId(4) }

describe('enregistrer un atelier collectif', () => {
  it.each<Cas>([
    {
      cas: 'refuse un utilisateur qui n’est pas médiateur',
      dependances,
      entree: { saisie, mediateurId: null },
      attendu: failure(ActionNonAutorisee()),
    },
    {
      cas: 'refuse de modifier un atelier introuvable chez le médiateur',
      dependances: { ...dependances, activiteDuMediateur: async () => null },
      entree: { saisie: enModification, mediateurId },
      attendu: failure(ActiviteIntrouvable()),
    },
    {
      cas: 'refuse de modifier un accompagnement individuel en atelier',
      dependances: {
        ...dependances,
        activiteDuMediateur: async () => ({
          ...existante,
          type: TypeDActivite('Individuel'),
        }),
      },
      entree: { saisie: enModification, mediateurId },
      attendu: failure(TypeDActiviteIncompatible()),
    },
    {
      cas: 'refuse un participant que le médiateur ne suit pas',
      dependances: { ...dependances, nombreDeSuivisDuMediateur: async () => 0 },
      entree: { saisie, mediateurId },
      attendu: failure(BeneficiaireIntrouvable()),
    },
    {
      cas: 'refuse un participant suivi inscrit deux fois',
      dependances,
      entree: { saisie: { ...saisie, suivis: [suivi, suivi] }, mediateurId },
      attendu: failure(BeneficiaireEnDouble()),
    },
    {
      cas: 'refuse un atelier sans participant',
      dependances,
      entree: { saisie: { ...saisie, suivis: [] }, mediateurId },
      attendu: failure(AtelierSansParticipant()),
    },
    {
      cas: 'refuse un lieu d’activité inutilisable',
      dependances: { ...dependances, lieuUtilisable: async () => false },
      entree: { saisie, mediateurId },
      attendu: failure(LieuInutilisable()),
    },
    {
      cas: 'refuse un tag que le médiateur ne peut pas utiliser',
      dependances,
      entree: {
        saisie: {
          ...saisie,
          tags: [TagId('8f6b2c1e-0d3a-4c5e-9b7f-1a2b3c4d5e6f')],
        },
        mediateurId,
      },
      attendu: failure(TagInutilisable()),
    },
    {
      cas: 'refuse un rendez-vous indisponible',
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
      cas: 'crée l’atelier sous un nouvel identifiant',
      dependances,
      entree: { saisie, mediateurId },
      attendu: success({ id: nouvelId, type: 'Collectif' }),
    },
    {
      cas: 'modifie l’atelier sous son identifiant',
      dependances,
      entree: { saisie: enModification, mediateurId },
      attendu: success({ id: activiteModifiee, type: 'Collectif' }),
    },
    {
      cas: 'enregistre l’atelier d’un rendez-vous disponible',
      dependances,
      entree: { saisie: avecRendezVous, mediateurId },
      attendu: success({ id: nouvelId, type: 'Collectif' }),
    },
  ])('$cas', async ({ dependances, entree, attendu }) => {
    expect(await enregistrerUnAtelierCollectif(dependances)(entree)).toEqual(
      attendu,
    )
  })
})
