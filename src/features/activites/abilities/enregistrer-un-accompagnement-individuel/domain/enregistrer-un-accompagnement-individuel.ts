import { failure, type Result, success } from '@/libraries/result'
import {
  type ActiviteIntrouvable,
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
  type AccompagnementEnregistre,
  accompagnementDeLaSaisie,
  type BeneficiaireSaisi,
  beneficiaireAccompagneDe,
  type SaisieIndividuelle,
} from './saisie-individuelle'

export type EchecDEnregistrement =
  | ActionNonAutorisee
  | ActiviteIntrouvable
  | TypeDActiviteIncompatible
  | BeneficiaireIntrouvable
  | LieuInutilisable
  | TagInutilisable
  | RendezVousIndisponible
  | DateTropLointaine

export type BeneficiaireDuMediateur = (criteres: {
  readonly id: BeneficiaireId
  readonly mediateurId: MediateurId
}) => Promise<{ readonly anonyme: boolean } | null>

export type DependancesDeLAccompagnementIndividuel =
  DependancesDeLaSaisieDeMediation & {
    readonly beneficiaireDuMediateur: BeneficiaireDuMediateur
  }

const suiviDe =
  (beneficiaireDuMediateur: BeneficiaireDuMediateur) =>
  async (
    beneficiaire: BeneficiaireSaisi,
    mediateurId: MediateurId,
  ): Promise<Result<BeneficiaireId | null, BeneficiaireIntrouvable>> => {
    if (beneficiaire.id === null) return success(null)
    const trouve = await beneficiaireDuMediateur({
      id: beneficiaire.id,
      mediateurId,
    })
    if (trouve === null) return failure(BeneficiaireIntrouvable())
    return success(trouve.anonyme ? null : beneficiaire.id)
  }

export const enregistrerUnAccompagnementIndividuel =
  (dependances: DependancesDeLAccompagnementIndividuel) =>
  async ({
    saisie,
    mediateurId,
  }: {
    readonly saisie: SaisieIndividuelle
    readonly mediateurId: MediateurId | null
  }): Promise<Result<AccompagnementEnregistre, EchecDEnregistrement>> => {
    if (mediateurId === null) return failure(ActionNonAutorisee())

    const enregistrement = await enregistrementDeMediation(dependances)({
      id: saisie.id,
      type: TypeDActivite('Individuel'),
      mediateurId,
    })
    if (!enregistrement.success) return enregistrement

    const suivi = await suiviDe(dependances.beneficiaireDuMediateur)(
      saisie.beneficiaire,
      mediateurId,
    )
    if (!suivi.success) return suivi

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
    const accompagnement = accompagnementDeLaSaisie({
      saisie,
      id: enregistrement.data.id,
      mediateurId,
      beneficiaire: beneficiaireAccompagneDe(saisie.beneficiaire, suivi.data),
      employeuse: await dependances.employeuseDeLaDate(saisie.date),
      origine: origineDeLaSaisie({ rdvId: saisie.rdvId, identifiantV1 }),
      creation,
      maintenant,
    })
    if (!accompagnement.success) return accompagnement

    await ecrireLActiviteDeMediation(dependances)(
      accompagnement.data,
      enregistrement.data,
    )

    if (saisie.rdvId !== null) {
      await dependances.marquerLeRendezVousHonore(saisie.rdvId)
    }

    return success({ id: accompagnement.data.id, type: 'Individuel' })
  }
