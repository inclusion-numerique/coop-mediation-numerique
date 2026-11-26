import { failure, type Result, success } from '@/libraries/result'
import {
  type ActiviteIntrouvable,
  type AtelierSansParticipant,
  type BeneficiaireEnDouble,
  type BeneficiaireId,
  BeneficiaireIntrouvable,
  creationOuModification,
  type DateTropLointaine,
  type DependancesDeLaSaisieDeMediation,
  ecrireLActiviteDeMediation,
  enregistrementDeMediation,
  type LieuInutilisable,
  lieuVerifie,
  type MediateurId,
  origineDeLaSaisie,
  type RendezVousIndisponible,
  rendezVousVerifie,
  type TagInutilisable,
  TypeDActivite,
  type TypeDActiviteIncompatible,
  tagsDeLaSaisie,
} from '../../../domain'
import { ActionNonAutorisee } from './errors'
import {
  type AtelierEnregistre,
  atelierDeLaSaisie,
  type SaisieCollective,
} from './saisie-collective'

export type EchecDEnregistrement =
  | ActionNonAutorisee
  | ActiviteIntrouvable
  | TypeDActiviteIncompatible
  | BeneficiaireIntrouvable
  | BeneficiaireEnDouble
  | AtelierSansParticipant
  | LieuInutilisable
  | TagInutilisable
  | RendezVousIndisponible
  | DateTropLointaine

export type NombreDeSuivisDuMediateur = (criteres: {
  readonly ids: readonly BeneficiaireId[]
  readonly mediateurId: MediateurId
}) => Promise<number>

export type DependancesDeLAtelierCollectif =
  DependancesDeLaSaisieDeMediation & {
    readonly nombreDeSuivisDuMediateur: NombreDeSuivisDuMediateur
  }

const suivisVerifies =
  (nombreDeSuivisDuMediateur: NombreDeSuivisDuMediateur) =>
  async (
    suivis: readonly BeneficiaireId[],
    mediateurId: MediateurId,
  ): Promise<Result<null, BeneficiaireIntrouvable>> => {
    if (suivis.length === 0) return success(null)
    const trouves = await nombreDeSuivisDuMediateur({
      ids: suivis,
      mediateurId,
    })
    return trouves === new Set(suivis).size
      ? success(null)
      : failure(BeneficiaireIntrouvable())
  }

export const enregistrerUnAtelierCollectif =
  (dependances: DependancesDeLAtelierCollectif) =>
  async ({
    saisie,
    mediateurId,
  }: {
    readonly saisie: SaisieCollective
    readonly mediateurId: MediateurId | null
  }): Promise<Result<AtelierEnregistre, EchecDEnregistrement>> => {
    if (mediateurId === null) return failure(ActionNonAutorisee())

    const enregistrement = await enregistrementDeMediation(dependances)({
      id: saisie.id,
      type: TypeDActivite('Collectif'),
      mediateurId,
    })
    if (!enregistrement.success) return enregistrement

    const suivis = await suivisVerifies(dependances.nombreDeSuivisDuMediateur)(
      saisie.suivis,
      mediateurId,
    )
    if (!suivis.success) return suivis

    const lieu = await lieuVerifie(
      saisie.lieu,
      enregistrement.data,
      dependances.lieuUtilisable,
    )
    if (!lieu.success) return lieu

    const tags = tagsDeLaSaisie(
      saisie.tags,
      await dependances.tagsUtilisables(saisie.tags),
    )
    if (!tags.success) return tags

    const rendezVous = await rendezVousVerifie(dependances)({
      rdvId: saisie.rdvId,
      activiteId: enregistrement.data.id,
      mediateurId,
    })
    if (!rendezVous.success) return rendezVous

    const maintenant = dependances.maintenant()
    const { creation, identifiantV1 } = creationOuModification(
      enregistrement.data,
      maintenant,
    )
    const atelier = atelierDeLaSaisie({
      saisie,
      id: enregistrement.data.id,
      mediateurId,
      employeuse: await dependances.employeuseDeLaDate(saisie.date),
      origine: origineDeLaSaisie({ rdvId: saisie.rdvId, identifiantV1 }),
      creation,
      maintenant,
    })
    if (!atelier.success) return atelier

    await ecrireLActiviteDeMediation(dependances)(
      atelier.data,
      enregistrement.data,
    )

    if (saisie.rdvId !== null) {
      await dependances.marquerLeRendezVousHonore(saisie.rdvId)
    }

    return success({ id: atelier.data.id, type: 'Collectif' })
  }
