import { z } from 'zod'
import { defineModel, type Model } from '@/libraries/model'

export const FiltreStatut = defineModel(
  z
    .enum(['actifs', 'inactifs', 'invitations', 'archives'])
    .brand('FiltreStatut'),
)
export type FiltreStatut = Model.TypeOf<typeof FiltreStatut>

export const FiltreRole = defineModel(
  z.enum(['conseiller-numerique', 'mediateur-numerique']).brand('FiltreRole'),
)
export type FiltreRole = Model.TypeOf<typeof FiltreRole>

const TriEquipe = defineModel(
  z.enum(['membre', 'structureEmployeuse', 'statut']).brand('TriEquipe'),
)
type TriEquipe = Model.TypeOf<typeof TriEquipe>

const OrdreDeTri = defineModel(z.enum(['asc', 'desc']).brand('OrdreDeTri'))
type OrdreDeTri = Model.TypeOf<typeof OrdreDeTri>

const Recherche = defineModel(
  z.string().trim().min(1).max(100).brand('Recherche'),
)
type Recherche = Model.TypeOf<typeof Recherche>

export type CriteresEquipe = {
  readonly recherche: Recherche | null
  readonly statuts: readonly FiltreStatut[]
  readonly role: FiltreRole | null
  readonly tri: TriEquipe
  readonly ordre: OrdreDeTri
}

export type ParametresDeRecherche = {
  readonly recherche?: string
  readonly statut?: string
  readonly role?: string
  readonly tri?: string
  readonly ordre?: string
}

const lire = <S extends z.ZodType>(
  schema: S,
  valeur: unknown,
): z.output<S> | null => {
  const lue = schema.safeParse(valeur)
  return lue.success ? lue.data : null
}

export const criteresEquipe = ({
  recherche,
  statut,
  role,
  tri,
  ordre,
}: ParametresDeRecherche): CriteresEquipe => ({
  recherche: lire(Recherche.schema, recherche),
  statuts: (statut ?? '').split(',').flatMap((valeur) => {
    const filtre = lire(FiltreStatut.schema, valeur)
    return filtre === null ? [] : [filtre]
  }),
  role: lire(FiltreRole.schema, role),
  tri: lire(TriEquipe.schema, tri) ?? TriEquipe('statut'),
  ordre: lire(OrdreDeTri.schema, ordre) ?? OrdreDeTri('asc'),
})
