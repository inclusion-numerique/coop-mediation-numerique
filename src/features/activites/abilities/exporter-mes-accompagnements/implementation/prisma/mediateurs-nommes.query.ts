import { prismaClient } from '@app/web/prismaClient'
import { getUserDisplayName } from '@app/web/utils/user'
import type { CoordinateurId, MediateurId } from '../../../../domain'

export type MediateurNomme = {
  readonly label: string
  readonly value: { readonly mediateurId: string }
}

type Appartenance = { readonly suppression: Date | null }

const estUnAncienMembre = (appartenances: readonly Appartenance[]): boolean =>
  appartenances.length > 0 &&
  appartenances.every(({ suppression }) => suppression !== null)

export const mediateursNommes = async ({
  ids,
  coordinateurId,
}: {
  readonly ids: readonly MediateurId[]
  readonly coordinateurId: CoordinateurId | null
}): Promise<readonly MediateurNomme[]> => {
  if (ids.length === 0) return []

  const lignes = await prismaClient.mediateur.findMany({
    where: { id: { in: [...ids] } },
    select: {
      id: true,
      user: {
        select: { firstName: true, lastName: true, name: true, email: true },
      },
      coordinations: {
        where: { coordinateurId: coordinateurId ?? undefined },
        select: { suppression: true },
      },
    },
    orderBy: [{ user: { lastName: 'asc' } }, { user: { firstName: 'asc' } }],
  })

  const nommes = lignes.map(({ id, user, coordinations }) => ({
    ancien: coordinateurId !== null && estUnAncienMembre(coordinations),
    nom: getUserDisplayName(user),
    value: { mediateurId: id },
  }))

  return [
    ...nommes.filter(({ ancien }) => !ancien),
    ...nommes.filter(({ ancien }) => ancien),
  ].map(({ ancien, nom, value }) => ({
    label: ancien ? `Ancien membre - ${nom}` : nom,
    value,
  }))
}
