import type { Model } from '@/libraries/model'
import { listeEnParametre } from '@/libraries/parametres-d-url'
import { type FiltreRole, FiltreStatut } from '../../../../domain/index'

export type RoleFiltre = Model.InputOf<typeof FiltreRole>

export type FilterParam = Model.InputOf<typeof FiltreStatut>

export type ParametresDeLaListe = {
  lignes?: string
  page?: string
  recherche?: string
  statut?: string
  role?: string
  tri?: string
  ordre?: string
}

type Parametres = Readonly<Record<string, string | null>>

export const roleEnParametres = (role: RoleFiltre | ''): Parametres => ({
  role: role === '' ? null : role,
  page: null,
})

export const statutsChoisis = (requete: {
  get(cle: string): string | null
}): FilterParam[] =>
  (requete.get('statut') ?? '').split(',').flatMap((valeur) => {
    const statut = FiltreStatut.schema.safeParse(valeur)
    return statut.success ? [statut.data] : []
  })

export const statutBascule = (
  requete: { get(cle: string): string | null },
  statut: FilterParam,
): Parametres => {
  const choisis = statutsChoisis(requete)
  return {
    statut: listeEnParametre(
      choisis.includes(statut)
        ? choisis.filter((choisi) => choisi !== statut)
        : [...choisis, statut],
    ),
    page: null,
  }
}

export const sansLesFiltres = (): Parametres => ({
  statut: null,
  role: null,
  page: null,
})
