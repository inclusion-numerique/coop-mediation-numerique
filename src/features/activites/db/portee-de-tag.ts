import { PorteeDeTag } from '../domain'

export const porteeDe = (tag: {
  readonly mediateurId: string | null
  readonly coordinateurId: string | null
  readonly departement: string | null
  readonly equipe: boolean | null
}): PorteeDeTag => {
  if (tag.equipe === true) return PorteeDeTag('Equipe')
  if (tag.mediateurId !== null || tag.coordinateurId !== null)
    return PorteeDeTag('Personnel')
  if (tag.departement !== null) return PorteeDeTag('Departemental')
  return PorteeDeTag('National')
}
