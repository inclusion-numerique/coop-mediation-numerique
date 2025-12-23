import Link from 'next/link'
import { MediateurListItem } from './MediateurListItem'

export type MediateurListProps = {
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

const buildMediateurHref = ({
  baseHref,
  userId,
  retour,
}: {
  baseHref: string
  userId: string
  retour: string
}) => {
  const searchParams = new URLSearchParams()
  searchParams.set('retour', retour)
  return `${baseHref}/${userId}?${searchParams.toString()}`
}

export const MediateurList = ({
  mediateurs,
  baseHref,
  baseRetour,
}: {
  mediateurs: MediateurListProps[]
  baseHref: string
  baseRetour: string
}) => (
  <ul className="fr-list-group fr-border--top fr-my-0">
    {mediateurs.map((mediateur) =>
      mediateur.type === 'coordinated' && mediateur.userId ? (
        <li
          className="fr-border--bottom fr-link--background-on-hover"
          key={mediateur.email}
        >
          <Link
            href={buildMediateurHref({
              baseHref,
              userId: mediateur.userId,
              retour: baseRetour,
            })}
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
