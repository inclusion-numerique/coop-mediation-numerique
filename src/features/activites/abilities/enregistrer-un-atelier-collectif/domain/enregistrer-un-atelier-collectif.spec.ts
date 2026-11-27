import { describe, expect, it } from 'vitest'
import { failure, type Result, success } from '@/libraries/result'
import {
  ActionNonAutorisee,
  type ActiviteDeMediationExistante,
  ActiviteId,
  ActiviteIntrouvable,
  type AtelierCollectif,
  AtelierSansParticipant,
  BeneficiaireEnDouble,
  BeneficiaireId,
  BeneficiaireIntrouvable,
  Commune,
  DateDActivite,
  DateTropLointaine,
  DureeEnMinutes,
  Effectif,
  EmployeuseId,
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
import { enregistrerUnAtelierCollectif } from './enregistrer-un-atelier-collectif'
import type { EchecDEnregistrerUnAtelierCollectif } from './errors'
import type { EnregistrerUnAtelierCollectifPorts } from './ports'
import type {
  AtelierCollectifEnregistre,
  SaisieCollective,
} from './saisie-collective'

type Entree = {
  readonly saisie: SaisieCollective
  readonly mediateurId: MediateurId | null
}

type Cas = {
  readonly cas: string
  readonly ports: EnregistrerUnAtelierCollectifPorts
  readonly entree: Entree
  readonly attendu: Result<
    AtelierCollectifEnregistre,
    EchecDEnregistrerUnAtelierCollectif
  >
}

const maintenant = new Date('2026-11-10T08:00:00Z')

const nouvelId = ActiviteId('a0000000-0000-4000-8000-000000000001')

const activiteModifiee = ActiviteId('a0000000-0000-4000-8000-000000000002')

const mediateurId = MediateurId('c0000000-0000-4000-8000-000000000001')

const suivi = BeneficiaireId('5b2d0c4e-8f1a-4c3b-9d7e-2a6f1b3c4d5e')

const lieuActiviteId = LieuActiviteId('d0000000-0000-4000-8000-000000000001')

const lyon = Commune({ nom: 'Lyon', codePostal: '69001', codeInsee: '69123' })

const creationExistante = new Date('2026-11-01T08:00:00Z')

const precedente = { lieuActiviteId: null, suivis: [], anonymesOrphelins: [] }

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
  creation: creationExistante,
  identifiantV1: null,
  precedente,
}

const ports: EnregistrerUnAtelierCollectifPorts = {
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
}

const thematiques = {
  mediation: [ThematiqueDeMediation('DiagnosticNumerique')],
  demarche: null,
}

const saisie: SaisieCollective = {
  id: null,
  date: DateDActivite('2026-11-05'),
  duree: DureeEnMinutes(90),
  lieu: { _tag: 'LieuActivite', lieuActiviteId },
  thematiques,
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

const atelier: AtelierCollectif = {
  _tag: 'Collectif',
  id: nouvelId,
  mediateurId,
  date: DateDActivite('2026-11-05'),
  duree: DureeEnMinutes(90),
  lieu: { _tag: 'LieuActivite', lieuActiviteId },
  thematiques,
  equipement: { _tag: 'AucunMateriel' },
  tags: [],
  notes: null,
  origine: { _tag: 'Saisie' },
  employeuse: null,
  creation: maintenant,
  modification: maintenant,
  titre: null,
  niveau: null,
  participants: { suivis: [suivi], anonymes: sansAnonyme },
}

describe('enregistrer un atelier collectif', () => {
  it.each<Cas>([
    {
      cas: 'refuse un utilisateur qui n’est pas médiateur',
      ports,
      entree: { saisie, mediateurId: null },
      attendu: failure(ActionNonAutorisee()),
    },
    {
      cas: 'refuse de modifier un atelier introuvable chez le médiateur',
      ports: { ...ports, activiteDuMediateur: async () => null },
      entree: { saisie: enModification, mediateurId },
      attendu: failure(ActiviteIntrouvable()),
    },
    {
      cas: 'refuse de modifier un accompagnement individuel en atelier',
      ports: {
        ...ports,
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
      ports: { ...ports, nombreDeSuivisDuMediateur: async () => 0 },
      entree: { saisie, mediateurId },
      attendu: failure(BeneficiaireIntrouvable()),
    },
    {
      cas: 'refuse un participant suivi inscrit deux fois',
      ports,
      entree: { saisie: { ...saisie, suivis: [suivi, suivi] }, mediateurId },
      attendu: failure(BeneficiaireEnDouble()),
    },
    {
      cas: 'refuse un atelier sans participant',
      ports,
      entree: { saisie: { ...saisie, suivis: [] }, mediateurId },
      attendu: failure(AtelierSansParticipant()),
    },
    {
      cas: 'refuse un lieu d’activité inutilisable',
      ports: { ...ports, lieuUtilisable: async () => false },
      entree: { saisie, mediateurId },
      attendu: failure(LieuInutilisable()),
    },
    {
      cas: 'refuse un tag que le médiateur ne peut pas utiliser',
      ports,
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
      ports: { ...ports, rendezVousDejaSaisi: async () => true },
      entree: { saisie: avecRendezVous, mediateurId },
      attendu: failure(RendezVousIndisponible()),
    },
    {
      cas: 'refuse une date au-delà de deux ans',
      ports,
      entree: {
        saisie: { ...saisie, date: DateDActivite('2029-01-01') },
        mediateurId,
      },
      attendu: failure(DateTropLointaine(DateDActivite('2028-11-10'))),
    },
    {
      cas: 'crée l’atelier avec ses participants sous un nouvel identifiant',
      ports,
      entree: { saisie, mediateurId },
      attendu: success({
        ecriture: { _tag: 'Creation', activite: atelier },
        rendezVousHonore: null,
      }),
    },
    {
      cas: 'modifie l’atelier sous son identifiant, à sa date de création',
      ports,
      entree: { saisie: enModification, mediateurId },
      attendu: success({
        ecriture: {
          _tag: 'Modification',
          activite: {
            ...atelier,
            id: activiteModifiee,
            creation: creationExistante,
          },
          precedente,
        },
        rendezVousHonore: null,
      }),
    },
    {
      cas: 'rattache l’atelier à l’employeuse du jour',
      ports: {
        ...ports,
        employeuseDeLaDate: async () => ({
          id: EmployeuseId(17),
          commune: lyon,
        }),
      },
      entree: { saisie, mediateurId },
      attendu: success({
        ecriture: {
          _tag: 'Creation',
          activite: { ...atelier, employeuse: EmployeuseId(17) },
        },
        rendezVousHonore: null,
      }),
    },
    {
      cas: 'honore le rendez-vous disponible dont l’atelier est issu',
      ports,
      entree: { saisie: avecRendezVous, mediateurId },
      attendu: success({
        ecriture: {
          _tag: 'Creation',
          activite: {
            ...atelier,
            origine: { _tag: 'RendezVous', rdvId: RdvId(4) },
          },
        },
        rendezVousHonore: RdvId(4),
      }),
    },
  ])('$cas', async ({ ports, entree, attendu }) => {
    expect(
      await enregistrerUnAtelierCollectif(ports)({ ...entree, maintenant }),
    ).toEqual(attendu)
  })
})
