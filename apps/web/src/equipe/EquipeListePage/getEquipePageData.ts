import { findConseillersNumeriquesContractInfoByEmails } from '@app/web/external-apis/conseiller-numerique/fetchConseillersCoordonnes'
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

const toUserEmail = ({ email }: { email: string }) => email

const finDeContratFor =
  (userEmail: string) =>
  (
    contracts: {
      email: string | null
      contractInfo: { dateFinDeContrat: Date | null } | null
    }[],
  ) => {
    const contractInfo = contracts.find(
      ({ email }) => email === userEmail.toLowerCase(),
    )?.contractInfo

    return contractInfo?.dateFinDeContrat &&
      isBefore(contractInfo.dateFinDeContrat, addMonths(new Date(), 3))
      ? `${format(new Date(contractInfo.dateFinDeContrat), 'dd.MM.yyyy')}`
      : undefined
  }

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

  const conseillersNumeriquesWithContrats =
    await findConseillersNumeriquesContractInfoByEmails(
      mediateurs.map(toUserEmail),
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
          finDeContrat: finDeContratFor(conseiller_numerique_id)(
            conseillersNumeriquesWithContrats,
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
