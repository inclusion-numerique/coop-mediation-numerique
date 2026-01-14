import Link from 'next/link'
import { MediateurListItem } from './MediateurListItem'

export type MediateurListProps = {
  departementCode: string
  id?: string
  userId?: string
  email: string
  firstName?: string
  lastName?: string
  phone?: string
  isConseillerNumerique: boolean
  status: string
  finDeContrat?: string
  type: 'coordinated' | 'invited'
}

export const MediateurList = ({
  mediateurs,
}: {
  mediateurs: MediateurListProps[]
}) => (
  <ul className="fr-list-group fr-border--top fr-my-0">
    {mediateurs.map((mediateur) =>
      mediateur.type === 'coordinated' && mediateur.userId ? (
        <li
          className="fr-border--bottom fr-link--background-on-hover"
          key={mediateur.email}
        >
          <Link
            href={`/coop/mon-reseau/${mediateur.departementCode}/acteurs/${mediateur.userId}`}
          >
            <MediateurListItem {...mediateur} />
          </Link>
        </li>
      ) : (
        <li className="fr-border--bottom" key={mediateur.email}>
          <MediateurListItem {...mediateur} />
        </li>
      ),
    )}
  </ul>
)
