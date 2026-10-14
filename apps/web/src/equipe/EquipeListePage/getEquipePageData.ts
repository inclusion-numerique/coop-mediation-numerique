import type { ContratConseillerNumerique } from '@app/web/conseiller-numerique/contratConseillerNumerique'
import { lireContratsConseillerNumerique } from '@app/web/conseiller-numerique/lireContratsConseillerNumerique'
import { getUserPublicActivityStatus } from '@app/web/features/utilisateurs/utils/getUserPublicActivityStatus'
import { countMediateursCoordonnesBy } from '@app/web/mediateurs/countMediateursCoordonnesBy'
import { dateAsDay } from '@app/web/utils/dateAsDay'
import { addMonths, format, isBefore } from 'date-fns'
import {
  type EquipeSearchParams,
  searchMediateursCoordonneBy,
} from './searchMediateursCoordonneBy'

export type MemberStatus =
  | 'invitation'
  | 'actif'
  | 'inactif'
  | 'autre'
  | 'supprime'

type StatusInput = {
  type: 'coordinated' | 'invited'
  creation: Date
  suppression: Date | null
  deleted: Date | null
  dateDerniereActivite: Date | null
}

type StatusRule = (
  input: StatusInput,
) => { label: string; memberStatus: MemberStatus } | null

const statusRules: StatusRule[] = [
  ({ type, creation }) =>
    type === 'invited'
      ? {
          label: `Invitation envoyée le ${dateAsDay(creation)}`,
          memberStatus: 'invitation',
        }
      : null,
  ({ deleted }) =>
    deleted != null
      ? {
          label: `Profil supprimé le ${dateAsDay(deleted)}`,
          memberStatus: 'supprime',
        }
      : null,
  ({ suppression }) =>
    suppression != null
      ? {
          label: `Ancien membre depuis le ${dateAsDay(suppression)}`,
          memberStatus: 'autre',
        }
      : null,
  ({ dateDerniereActivite }) => {
    const activityStatus = getUserPublicActivityStatus({
      lastActivityDate: dateDerniereActivite,
    })
    return {
      label: activityStatus.label,
      memberStatus: activityStatus.status,
    }
  },
]

const statusForMembre = (
  input: StatusInput,
): { label: string; memberStatus: MemberStatus } =>
  statusRules.reduce<{ label: string; memberStatus: MemberStatus } | null>(
    (result, rule) => result ?? rule(input),
    null,
  ) ?? { label: '', memberStatus: 'autre' }

const finDeContrat = (contrat: ContratConseillerNumerique | undefined) =>
  contrat?.fin && isBefore(contrat.fin, addMonths(new Date(), 3))
    ? format(contrat.fin, 'dd.MM.yyyy')
    : undefined

export const getEquipePageData = async ({
  searchParams,
  coordinateur,
}: {
  searchParams: EquipeSearchParams
  coordinateur: {
    id: string
    mediateursCoordonnes: { mediateurId: string }[]
  }
}) => {
  const { mediateurs, matchesCount, totalPages } =
    await searchMediateursCoordonneBy(coordinateur)(searchParams)

  const contrats = await lireContratsConseillerNumerique(
    mediateurs.flatMap(({ user_id }) => (user_id == null ? [] : [user_id])),
  )

  const stats = await countMediateursCoordonnesBy(coordinateur)

  return {
    mediateurs: mediateurs.map(
      ({
        mediateur_id,
        user_id,
        email,
        phone,
        first_name,
        last_name,
        is_conseiller_numerique,
        date_derniere_activite,
        suppression,
        deleted,
        creation,
        type,
        structure_employeuse,
      }) => {
        const status = statusForMembre({
          type,
          creation,
          suppression,
          deleted,
          dateDerniereActivite: date_derniere_activite,
        })
        return {
          id: mediateur_id ?? undefined,
          userId: user_id ?? undefined,
          firstName: first_name ?? undefined,
          lastName: last_name ?? undefined,
          phone: phone ?? undefined,
          email,
          isConseillerNumerique: is_conseiller_numerique === true,
          status: status.label,
          memberStatus: status.memberStatus,
          lastActivityDate: date_derniere_activite,
          finDeContrat: finDeContrat(
            user_id == null ? undefined : contrats.get(user_id),
          ),
          type,
          structureEmployeuse: structure_employeuse ?? undefined,
          coordinateurId: coordinateur.id,
          sentAt: creation,
          archivedFrom: creation,
          archivedTo: deleted ?? suppression ?? undefined,
        }
      },
    ),
    stats,
    matchesCount,
    totalPages,
  }
}

export type MonEquipePageData = Awaited<ReturnType<typeof getEquipePageData>>
