import { failure, type Result, success } from '@app/web/libraries/result'
import type { ActiviteId } from './activite-id'
import type { Autonomie } from './autonomie'
import type { BeneficiaireId } from './beneficiaire-id'
import type { Commune } from './commune'
import type { DateDActivite } from './date-d-activite'
import type { DureeEnMinutes } from './duree-en-minutes'
import { Effectif } from './effectif'
import type { EmployeuseId } from './employeuse-id'
import {
  AtelierSansParticipant,
  AucuneThematique,
  AucunMaterielAvecMateriel,
  type AxeDeRepartition,
  BeneficiaireEnDouble,
  DejaAccompagnesExcedeLeTotal,
  MaterielEnDouble,
  RepartitionExcedeLeTotal,
  ThematiqueEnDouble,
  TropDeParticipantsAnonymes,
} from './errors'
import type { Genre } from './genre'
import type { IdentifiantCraV1 } from './identifiant-cra-v1'
import type { LieuActiviteId } from './lieu-activite-id'
import type { Materiel } from './materiel'
import type { MediateurId } from './mediateur-id'
import type { NiveauDAtelier } from './niveau-d-atelier'
import type { Notes } from './notes'
import type { PrecisionDeDemarche } from './precision-de-demarche'
import type { RdvId } from './rdv-id'
import type { StatutSocial } from './statut-social'
import type { StructureDeRedirection } from './structure-de-redirection'
import type { TagId } from './tag-id'
import type { ThematiqueAdministrative } from './thematique-administrative'
import type { ThematiqueDeMediation } from './thematique-de-mediation'
import type { TitreDAtelier } from './titre-d-atelier'
import type { TrancheDAge } from './tranche-d-age'

export const PARTICIPANTS_ANONYMES_MAXIMUM = 10_000

export type Lieu =
  | { readonly _tag: 'LieuActivite'; readonly lieuActiviteId: LieuActiviteId }
  | { readonly _tag: 'Domicile'; readonly commune: Commune }
  | { readonly _tag: 'Autre'; readonly commune: Commune }
  | {
      readonly _tag: 'ADistance'
      readonly communeDeRattachement: Commune | null
    }

export type DemarcheAdministrative = {
  readonly thematiques: readonly ThematiqueAdministrative[]
  readonly precision: PrecisionDeDemarche | null
}

export type Thematiques = {
  readonly mediation: readonly ThematiqueDeMediation[]
  readonly demarche: DemarcheAdministrative | null
}

export type Equipement =
  | { readonly _tag: 'NonRenseigne' }
  | { readonly _tag: 'AucunMateriel' }
  | {
      readonly _tag: 'Materiels'
      readonly materiels: readonly [Materiel, ...Materiel[]]
    }

export type Origine =
  | { readonly _tag: 'Saisie' }
  | { readonly _tag: 'RendezVous'; readonly rdvId: RdvId }
  | { readonly _tag: 'ImportV1'; readonly identifiant: IdentifiantCraV1 }

export type Orientation =
  | { readonly _tag: 'NonRenseignee' }
  | { readonly _tag: 'NonOriente' }
  | { readonly _tag: 'Oriente'; readonly vers: StructureDeRedirection | null }

export type ProfilAnonyme = {
  readonly genre: Genre
  readonly trancheDAge: TrancheDAge
  readonly statutSocial: StatutSocial
  readonly residence: Commune | null
}

export type BeneficiaireAccompagne =
  | { readonly _tag: 'Suivi'; readonly id: BeneficiaireId }
  | {
      readonly _tag: 'Anonyme'
      readonly dejaAccompagne: boolean
      readonly profil: ProfilAnonyme
    }

export type RepartitionParGenre = {
  readonly masculin: Effectif
  readonly feminin: Effectif
  readonly nonCommunique: Effectif
}

export type RepartitionParTrancheDAge = {
  readonly moinsDeDouze: Effectif
  readonly douzeDixHuit: Effectif
  readonly dixHuitVingtQuatre: Effectif
  readonly vingtCinqTrenteNeuf: Effectif
  readonly quaranteCinquanteNeuf: Effectif
  readonly soixanteSoixanteNeuf: Effectif
  readonly soixanteDixPlus: Effectif
  readonly nonCommunique: Effectif
}

export type RepartitionParStatutSocial = {
  readonly scolarise: Effectif
  readonly sansEmploi: Effectif
  readonly enEmploi: Effectif
  readonly retraite: Effectif
  readonly nonCommunique: Effectif
}

export type ParticipantsAnonymes = {
  readonly total: Effectif
  readonly dejaAccompagnes: Effectif
  readonly genres: RepartitionParGenre
  readonly tranchesDAge: RepartitionParTrancheDAge
  readonly statutsSociaux: RepartitionParStatutSocial
}

export type Participants = {
  readonly suivis: readonly BeneficiaireId[]
  readonly anonymes: ParticipantsAnonymes
}

type Commun = {
  readonly id: ActiviteId
  readonly mediateurId: MediateurId
  readonly date: DateDActivite
  readonly duree: DureeEnMinutes
  readonly lieu: Lieu
  readonly thematiques: Thematiques
  readonly equipement: Equipement
  readonly tags: readonly TagId[]
  readonly notes: Notes | null
  readonly origine: Origine
  readonly employeuse: EmployeuseId | null
  readonly creation: Date
  readonly modification: Date
}

export type AccompagnementIndividuel = Commun & {
  readonly _tag: 'Individuel'
  readonly beneficiaire: BeneficiaireAccompagne
  readonly autonomie: Autonomie | null
  readonly orientation: Orientation
}

export type AtelierCollectif = Commun & {
  readonly _tag: 'Collectif'
  readonly titre: TitreDAtelier | null
  readonly niveau: NiveauDAtelier | null
  readonly participants: Participants
}

export type ActiviteDeMediation = AccompagnementIndividuel | AtelierCollectif

const sansDoublon = <T>(valeurs: readonly T[]): boolean =>
  new Set(valeurs).size === valeurs.length

const somme = (effectifs: readonly Effectif[]): number =>
  effectifs.reduce<number>((total, effectif) => total + effectif, 0)

export const thematiquesDe = (
  thematiques: Thematiques,
): Result<Thematiques, AucuneThematique | ThematiqueEnDouble> => {
  if (thematiques.mediation.length === 0 && thematiques.demarche === null) {
    return failure(AucuneThematique())
  }
  const enDouble =
    !sansDoublon(thematiques.mediation) ||
    !sansDoublon(thematiques.demarche?.thematiques ?? [])
  return enDouble ? failure(ThematiqueEnDouble()) : success(thematiques)
}

export const equipementDe = ({
  aucunMateriel,
  materiels,
}: {
  readonly aucunMateriel: boolean
  readonly materiels: readonly Materiel[]
}): Result<Equipement, AucunMaterielAvecMateriel | MaterielEnDouble> => {
  if (!sansDoublon(materiels)) {
    return failure(MaterielEnDouble())
  }
  const [premier, ...autres] = materiels
  if (aucunMateriel) {
    return premier === undefined
      ? success({ _tag: 'AucunMateriel' })
      : failure(AucunMaterielAvecMateriel())
  }
  return premier === undefined
    ? success({ _tag: 'NonRenseigne' })
    : success({ _tag: 'Materiels', materiels: [premier, ...autres] })
}

const reliquatDe = (
  axe: AxeDeRepartition,
  total: Effectif,
  renseignes: readonly Effectif[],
): Result<Effectif, RepartitionExcedeLeTotal> => {
  const reliquat = total - somme(renseignes)
  return reliquat < 0
    ? failure(RepartitionExcedeLeTotal(axe))
    : success(Effectif(reliquat))
}

export type SaisieDesParticipantsAnonymes = {
  readonly total: Effectif
  readonly dejaAccompagnes: Effectif
  readonly genres: Omit<RepartitionParGenre, 'nonCommunique'>
  readonly tranchesDAge: Omit<RepartitionParTrancheDAge, 'nonCommunique'>
  readonly statutsSociaux: Omit<RepartitionParStatutSocial, 'nonCommunique'>
}

export const participantsAnonymesDe = (
  saisie: SaisieDesParticipantsAnonymes,
): Result<
  ParticipantsAnonymes,
  | TropDeParticipantsAnonymes
  | DejaAccompagnesExcedeLeTotal
  | RepartitionExcedeLeTotal
> => {
  if (saisie.total > PARTICIPANTS_ANONYMES_MAXIMUM) {
    return failure(TropDeParticipantsAnonymes())
  }
  if (saisie.dejaAccompagnes > saisie.total) {
    return failure(DejaAccompagnesExcedeLeTotal())
  }
  const genres = reliquatDe('genre', saisie.total, Object.values(saisie.genres))
  if (!genres.success) {
    return genres
  }
  const tranchesDAge = reliquatDe(
    'trancheDAge',
    saisie.total,
    Object.values(saisie.tranchesDAge),
  )
  if (!tranchesDAge.success) {
    return tranchesDAge
  }
  const statutsSociaux = reliquatDe(
    'statutSocial',
    saisie.total,
    Object.values(saisie.statutsSociaux),
  )
  if (!statutsSociaux.success) {
    return statutsSociaux
  }
  return success({
    total: saisie.total,
    dejaAccompagnes: saisie.dejaAccompagnes,
    genres: { ...saisie.genres, nonCommunique: genres.data },
    tranchesDAge: { ...saisie.tranchesDAge, nonCommunique: tranchesDAge.data },
    statutsSociaux: {
      ...saisie.statutsSociaux,
      nonCommunique: statutsSociaux.data,
    },
  })
}

export const participantsDeLAtelier = (
  participants: Participants,
): Result<Participants, AtelierSansParticipant | BeneficiaireEnDouble> => {
  if (participants.suivis.length + participants.anonymes.total === 0) {
    return failure(AtelierSansParticipant())
  }
  return sansDoublon(participants.suivis)
    ? success(participants)
    : failure(BeneficiaireEnDouble())
}

export const nombreDAccompagnements = (
  activite: ActiviteDeMediation,
): Effectif =>
  activite._tag === 'Individuel'
    ? Effectif(1)
    : Effectif(
        activite.participants.suivis.length +
          activite.participants.anonymes.total,
      )

export const aucuneParticipationAnonyme: SaisieDesParticipantsAnonymes = {
  total: Effectif(0),
  dejaAccompagnes: Effectif(0),
  genres: { masculin: Effectif(0), feminin: Effectif(0) },
  tranchesDAge: {
    moinsDeDouze: Effectif(0),
    douzeDixHuit: Effectif(0),
    dixHuitVingtQuatre: Effectif(0),
    vingtCinqTrenteNeuf: Effectif(0),
    quaranteCinquanteNeuf: Effectif(0),
    soixanteSoixanteNeuf: Effectif(0),
    soixanteDixPlus: Effectif(0),
  },
  statutsSociaux: {
    scolarise: Effectif(0),
    sansEmploi: Effectif(0),
    enEmploi: Effectif(0),
    retraite: Effectif(0),
  },
}
