import { describe, expect, it } from 'vitest'
import { failure, type Result, success } from '@/libraries/result'
import {
  type AccompagnementIndividuel,
  ActionNonAutorisee,
  type ActiviteDeMediationExistante,
  ActiviteId,
  ActiviteIntrouvable,
  BeneficiaireId,
  BeneficiaireIntrouvable,
  Commune,
  DateDActivite,
  DateTropLointaine,
  DureeEnMinutes,
  EmployeuseId,
  Genre,
  IdentifiantCraV1,
  LieuActiviteId,
  LieuInutilisable,
  MediateurId,
  NomDeTag,
  type ProfilAnonyme,
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
import { enregistrerUnAccompagnementIndividuel } from './enregistrer-un-accompagnement-individuel'
import type { EchecDEnregistrerUnAccompagnementIndividuel } from './errors'
import type { EnregistrerUnAccompagnementIndividuelPorts } from './ports'
import type {
  AccompagnementIndividuelEnregistre,
  SaisieIndividuelle,
} from './saisie-individuelle'

type Entree = {
  readonly saisie: SaisieIndividuelle
  readonly mediateurId: MediateurId | null
}

type Cas = {
  readonly cas: string
  readonly ports: EnregistrerUnAccompagnementIndividuelPorts
  readonly entree: Entree
  readonly attendu: Result<
    AccompagnementIndividuelEnregistre,
    EchecDEnregistrerUnAccompagnementIndividuel
  >
}

const maintenant = new Date('2026-11-10T08:00:00Z')

const nouvelId = ActiviteId('a0000000-0000-4000-8000-000000000001')

const activiteModifiee = ActiviteId('a0000000-0000-4000-8000-000000000002')

const mediateurId = MediateurId('c0000000-0000-4000-8000-000000000001')

const lieuActiviteId = LieuActiviteId('d0000000-0000-4000-8000-000000000001')

const tagId = TagId('8f6b2c1e-0d3a-4c5e-9b7f-1a2b3c4d5e6f')

const suivi = BeneficiaireId('5b2d0c4e-8f1a-4c3b-9d7e-2a6f1b3c4d5e')

const lyon = Commune({ nom: 'Lyon', codePostal: '69001', codeInsee: '69123' })

const creationExistante = new Date('2026-11-01T08:00:00Z')

const precedente = { lieuActiviteId, suivis: [], anonymesOrphelins: [] }

const existante: ActiviteDeMediationExistante = {
  type: TypeDActivite('Individuel'),
  creation: creationExistante,
  identifiantV1: null,
  precedente,
}

const ports: EnregistrerUnAccompagnementIndividuelPorts = {
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
}

const profil: ProfilAnonyme = {
  genre: Genre('Feminin'),
  trancheDAge: TrancheDAge('VingtCinqTrenteNeuf'),
  statutSocial: StatutSocial('EnEmploi'),
  residence: null,
}

const thematiques = {
  mediation: [ThematiqueDeMediation('DiagnosticNumerique')],
  demarche: null,
}

const saisie: SaisieIndividuelle = {
  id: null,
  date: DateDActivite('2026-11-05'),
  duree: DureeEnMinutes(45),
  lieu: { _tag: 'ADistance' },
  thematiques,
  equipement: { _tag: 'NonRenseigne' },
  tags: [],
  notes: null,
  rdvId: null,
  beneficiaire: { id: null, dejaAccompagne: true, profil },
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

const accompagnement: AccompagnementIndividuel = {
  _tag: 'Individuel',
  id: nouvelId,
  mediateurId,
  date: DateDActivite('2026-11-05'),
  duree: DureeEnMinutes(45),
  lieu: { _tag: 'ADistance', communeDeRattachement: null },
  thematiques,
  equipement: { _tag: 'NonRenseigne' },
  tags: [],
  notes: null,
  origine: { _tag: 'Saisie' },
  employeuse: null,
  creation: maintenant,
  modification: maintenant,
  beneficiaire: { _tag: 'Anonyme', dejaAccompagne: true, profil },
  autonomie: null,
  orientation: { _tag: 'NonRenseignee' },
}

const accompagnementModifie: AccompagnementIndividuel = {
  ...accompagnement,
  id: activiteModifiee,
  creation: creationExistante,
}

describe('enregistrer un accompagnement individuel', () => {
  it.each<Cas>([
    {
      cas: 'refuse un utilisateur qui n’est pas médiateur',
      ports,
      entree: { saisie, mediateurId: null },
      attendu: failure(ActionNonAutorisee()),
    },
    {
      cas: 'refuse de modifier une activité introuvable chez le médiateur',
      ports: { ...ports, activiteDuMediateur: async () => null },
      entree: { saisie: enModification, mediateurId },
      attendu: failure(ActiviteIntrouvable()),
    },
    {
      cas: 'refuse de modifier un atelier collectif en accompagnement individuel',
      ports: {
        ...ports,
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
      ports: { ...ports, beneficiaireDuMediateur: async () => null },
      entree: { saisie: avecSuivi, mediateurId },
      attendu: failure(BeneficiaireIntrouvable()),
    },
    {
      cas: 'refuse un lieu d’activité inutilisable à la création',
      ports: { ...ports, lieuUtilisable: async () => false },
      entree: { saisie: auLieuDActivite, mediateurId },
      attendu: failure(LieuInutilisable()),
    },
    {
      cas: 'refuse un lieu d’activité inutilisable à la modification',
      ports: { ...ports, lieuUtilisable: async () => false },
      entree: {
        saisie: { ...auLieuDActivite, id: activiteModifiee },
        mediateurId,
      },
      attendu: failure(LieuInutilisable()),
    },
    {
      cas: 'refuse un tag que le médiateur ne peut pas utiliser',
      ports,
      entree: { saisie: { ...saisie, tags: [tagId] }, mediateurId },
      attendu: failure(TagInutilisable()),
    },
    {
      cas: 'refuse le rendez-vous d’un autre médiateur',
      ports: { ...ports, rendezVousDUnAutreMediateur: async () => true },
      entree: { saisie: avecRendezVous, mediateurId },
      attendu: failure(RendezVousIndisponible()),
    },
    {
      cas: 'refuse un rendez-vous déjà saisi dans une autre activité',
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
      cas: 'crée l’accompagnement anonyme sous un nouvel identifiant',
      ports,
      entree: { saisie, mediateurId },
      attendu: success({
        ecriture: { _tag: 'Creation', activite: accompagnement },
        rendezVousHonore: null,
      }),
    },
    {
      cas: 'modifie l’accompagnement sous son identifiant, à sa date de création',
      ports,
      entree: { saisie: enModification, mediateurId },
      attendu: success({
        ecriture: {
          _tag: 'Modification',
          activite: accompagnementModifie,
          precedente,
        },
        rendezVousHonore: null,
      }),
    },
    {
      cas: 'garde l’origine d’un accompagnement importé de la V1',
      ports: {
        ...ports,
        activiteDuMediateur: async () => ({
          ...existante,
          identifiantV1: IdentifiantCraV1('cra-v1'),
        }),
      },
      entree: { saisie: enModification, mediateurId },
      attendu: success({
        ecriture: {
          _tag: 'Modification',
          activite: {
            ...accompagnementModifie,
            origine: {
              _tag: 'ImportV1',
              identifiant: IdentifiantCraV1('cra-v1'),
            },
          },
          precedente,
        },
        rendezVousHonore: null,
      }),
    },
    {
      cas: 'désigne le bénéficiaire suivi',
      ports,
      entree: { saisie: avecSuivi, mediateurId },
      attendu: success({
        ecriture: {
          _tag: 'Creation',
          activite: {
            ...accompagnement,
            beneficiaire: { _tag: 'Suivi', id: suivi },
          },
        },
        rendezVousHonore: null,
      }),
    },
    {
      cas: 'garde anonyme un bénéficiaire désigné mais anonyme',
      ports: {
        ...ports,
        beneficiaireDuMediateur: async () => ({ anonyme: true }),
      },
      entree: { saisie: avecSuivi, mediateurId },
      attendu: success({
        ecriture: { _tag: 'Creation', activite: accompagnement },
        rendezVousHonore: null,
      }),
    },
    {
      cas: 'enregistre l’accompagnement dans un lieu d’activité utilisable',
      ports,
      entree: { saisie: auLieuDActivite, mediateurId },
      attendu: success({
        ecriture: {
          _tag: 'Creation',
          activite: {
            ...accompagnement,
            lieu: { _tag: 'LieuActivite', lieuActiviteId },
          },
        },
        rendezVousHonore: null,
      }),
    },
    {
      cas: 'garde les tags utilisables choisis',
      ports: {
        ...ports,
        tagsUtilisables: async () => [
          { id: tagId, nom: NomDeTag('Numérique') },
        ],
      },
      entree: { saisie: { ...saisie, tags: [tagId] }, mediateurId },
      attendu: success({
        ecriture: {
          _tag: 'Creation',
          activite: { ...accompagnement, tags: [tagId] },
        },
        rendezVousHonore: null,
      }),
    },
    {
      cas: 'rattache l’accompagnement à distance à l’employeuse du jour et à sa commune',
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
          activite: {
            ...accompagnement,
            lieu: { _tag: 'ADistance', communeDeRattachement: lyon },
            employeuse: EmployeuseId(17),
          },
        },
        rendezVousHonore: null,
      }),
    },
    {
      cas: 'honore le rendez-vous disponible dont l’accompagnement est issu',
      ports,
      entree: { saisie: avecRendezVous, mediateurId },
      attendu: success({
        ecriture: {
          _tag: 'Creation',
          activite: {
            ...accompagnement,
            origine: { _tag: 'RendezVous', rdvId: RdvId(4) },
          },
        },
        rendezVousHonore: RdvId(4),
      }),
    },
  ])('$cas', async ({ ports, entree, attendu }) => {
    expect(
      await enregistrerUnAccompagnementIndividuel(ports)({
        ...entree,
        maintenant,
      }),
    ).toEqual(attendu)
  })
})
