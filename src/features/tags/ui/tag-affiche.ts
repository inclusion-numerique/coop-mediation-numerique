import type { TypeDePortee } from '../domain'

export type EquipeAffichee = {
  readonly numero: number
  readonly coordonneePar: string
}

export type TagAffiche = {
  readonly id: string
  readonly nom: string
  readonly description: string | null
  readonly portee: TypeDePortee
  readonly equipe: EquipeAffichee | null
}
