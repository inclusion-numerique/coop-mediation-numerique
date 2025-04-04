import Link from 'next/link'
import { MediateurListItem } from './MediateurListItem'

export type MediateurListProps = {
  id?: string
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
  baseHref,
}: {
  mediateurs: MediateurListProps[]
  baseHref: string
}) => (
  <ul className="fr-list-group fr-border--top fr-my-0">
    {mediateurs.map((mediateur) =>
      mediateur.type === 'coordinated' ? (
        <li
          className="fr-border--bottom fr-link--background-on-hover"
          key={mediateur.email}
        >
          <Link href={`${baseHref}/${mediateur.id}`}>
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
