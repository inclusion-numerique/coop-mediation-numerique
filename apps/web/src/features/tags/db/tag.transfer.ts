import { CodeDepartement } from '@app/web/libraries/departement'
import {
  CoordinateurId,
  DescriptionDuTag,
  MediateurId,
  NomDuTag,
  type Portee,
  type Tag,
  TagId,
} from '../domain'

export type TagRow = {
  readonly id: string
  readonly nom: string
  readonly description: string | null
  readonly mediateurId: string | null
  readonly coordinateurId: string | null
  readonly departement: string | null
  readonly equipe: boolean | null
}

export type ColonnesDePortee = Pick<
  TagRow,
  'mediateurId' | 'coordinateurId' | 'departement' | 'equipe'
>

const porteeToDomain = (row: ColonnesDePortee): Portee | null => {
  if (row.equipe === true && row.coordinateurId !== null)
    return {
      _tag: 'Equipe',
      coordinateurId: CoordinateurId(row.coordinateurId),
    }
  if (row.mediateurId !== null)
    return {
      _tag: 'Personnel',
      proprietaire: {
        _tag: 'Mediateur',
        mediateurId: MediateurId(row.mediateurId),
      },
    }
  if (row.coordinateurId !== null)
    return {
      _tag: 'Personnel',
      proprietaire: {
        _tag: 'Coordinateur',
        coordinateurId: CoordinateurId(row.coordinateurId),
      },
    }
  if (row.departement === null) return { _tag: 'National' }

  const departement = CodeDepartement.safe(row.departement)
  return departement === null ? null : { _tag: 'Departemental', departement }
}

export const tagToDomain = (row: TagRow): Tag | null => {
  const nom = NomDuTag.safe(row.nom)
  const portee = porteeToDomain(row)

  return nom === null || portee === null
    ? null
    : {
        id: TagId(row.id),
        nom,
        description: DescriptionDuTag.safe(row.description ?? ''),
        portee,
      }
}

const AUCUNE_PORTEE: ColonnesDePortee = {
  mediateurId: null,
  coordinateurId: null,
  departement: null,
  equipe: null,
}

export const porteeFromDomain = (portee: Portee): ColonnesDePortee => {
  if (portee._tag === 'Personnel')
    return portee.proprietaire._tag === 'Mediateur'
      ? { ...AUCUNE_PORTEE, mediateurId: portee.proprietaire.mediateurId }
      : { ...AUCUNE_PORTEE, coordinateurId: portee.proprietaire.coordinateurId }
  if (portee._tag === 'Equipe')
    return {
      ...AUCUNE_PORTEE,
      coordinateurId: portee.coordinateurId,
      equipe: true,
    }
  if (portee._tag === 'Departemental')
    return { ...AUCUNE_PORTEE, departement: portee.departement }
  return AUCUNE_PORTEE
}

export const tagFromDomain = (tag: Tag): TagRow => ({
  id: tag.id,
  nom: tag.nom,
  description: tag.description,
  ...porteeFromDomain(tag.portee),
})
