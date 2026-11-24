import Link from 'next/link'
import { dateAsDayAndTime } from '@/libraries/date/date-as-day-and-time'
import { routeConstruite } from '@/libraries/nextjs/route/route-construite'
import { optionalNumberToString } from '@/libraries/nombre/format-number'
import type { EmployeuseAffichee } from '../presenters/employeuse-affichee.presenter'

export const EmployeuseTableRow = ({
  employeuse,
  baseHref,
}: {
  employeuse: EmployeuseAffichee
  baseHref: string
}) => (
  <tr className="fr-enlarge-link fr-table-row--link">
    <td className="fr-cell--data">{employeuse.nom}</td>
    <td className="fr-cell--data">{employeuse.siret}</td>
    <td className="fr-cell--data">
      <div>
        <div className="fr-text--sm fr-mb-0">{employeuse.adresse}</div>
        <div className="fr-text--xs fr-text-mention--grey fr-mb-0">
          {employeuse.codePostal}
        </div>
      </div>
    </td>
    <td className="fr-cell--data">{employeuse.commune}</td>
    <td className="fr-cell--data">
      {optionalNumberToString(employeuse._count.emplois, null)}
    </td>
    <td className="fr-cell--data">{dateAsDayAndTime(employeuse.creation)}</td>
    <td className="fr-cell--data">
      {dateAsDayAndTime(employeuse.modification)}
    </td>
    <td className="fr-p-0">
      <Link href={routeConstruite(`${baseHref}/${employeuse.id}`)}>
        <span className="fr-sr-only">Voir la structure {employeuse.nom}</span>
      </Link>
    </td>
  </tr>
)
