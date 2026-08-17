import { failure, type Result, success } from '@app/web/libraries/result'
import { type CompteRdv, estUtilisable } from '../../../domain/compte-rdv'
import {
  CompteNonLie,
  type ErreurRdvApi,
  RdvIntrouvable,
} from '../../../domain/errors'
import type { RdvId } from '../../../domain/rdv-id'
import type { UtilisateurCoopId } from '../../../domain/utilisateur-coop-id'
import { RdvNonAutorise } from './errors'
import type {
  BeneficiaireFusionne,
  MediateurRedacteurId,
  ParticipationDuRdv,
  RdvPourActivite,
  UsagerDuRdv,
} from './rdv-pour-activite'

export type ErreurCreationActivite = RdvNonAutorise | ErreurRdvApi

export type CreerActiviteDepuisRdv = (input: {
  readonly utilisateurId: UtilisateurCoopId
  readonly mediateurId: MediateurRedacteurId
  readonly rdvId: RdvId
}) => Promise<
  Result<{ readonly urlCreationCra: string }, ErreurCreationActivite>
>

export type LireRdvPourActivite = (
  rdvId: RdvId,
) => Promise<RdvPourActivite | null>

export type CompteDuRedacteur = (
  utilisateurId: UtilisateurCoopId,
) => Promise<CompteRdv | null>

/** Port vers la feature bénéficiaire : crée ou rapproche les fiches des usagers. */
export type CreerOuFusionnerBeneficiaires = (input: {
  readonly usagers: readonly UsagerDuRdv[]
  readonly mediateurId: MediateurRedacteurId
}) => Promise<readonly BeneficiaireFusionne[]>

/** Port vers la feature activités : rend l'URL du formulaire de CRA pré-rempli. */
export type PreparerUrlCreationCra = (input: {
  readonly rdvId: RdvId
  readonly mediateurId: MediateurRedacteurId
  readonly beneficiaires: readonly BeneficiaireFusionne[]
}) => Promise<string>

export const verifierRdv = ({
  rdv,
  compte,
  rdvId,
}: {
  rdv: RdvPourActivite | null
  compte: CompteRdv | null
  rdvId: RdvId
}): Result<RdvPourActivite, ErreurCreationActivite> => {
  if (compte === null) {
    return failure(CompteNonLie(null))
  }

  if (!estUtilisable(compte)) {
    return failure(CompteNonLie(compte.agentId))
  }

  if (rdv === null) {
    return failure(RdvIntrouvable(rdvId))
  }

  return rdv.agentId === compte.agentId
    ? success(rdv)
    : failure(RdvNonAutorise(rdvId))
}

/**
 * Usagers pour lesquels une fiche bénéficiaire doit exister.
 *
 * Seuls comptent ceux qui étaient là — `seen` — et ceux dont la présence n'a pas
 * encore été saisie, un CRA rédigé après coup valant justement constat de
 * présence. Les absences et annulations sont écartées : leur créer une fiche
 * bénéficiaire au passage reviendrait à peupler le carnet du médiateur de
 * personnes qu'il n'a jamais rencontrées.
 */
export const usagersPourActivite = (
  rdv: RdvPourActivite,
): readonly UsagerDuRdv[] =>
  rdv.participations
    .filter(
      (participation: ParticipationDuRdv) =>
        participation.statutPresence === 'seen' ||
        participation.statutPresence === 'unknown',
    )
    .map((participation) => participation.usager)
