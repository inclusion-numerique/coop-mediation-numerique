import type { CodeDepartement } from '@/libraries/insee'

export type OptionDeCommune = {
  readonly value: string
  readonly label: string
}

export type CommunesDesLieux = (options: {
  departementCode: CodeDepartement
}) => Promise<{ readonly communesOptions: readonly OptionDeCommune[] }>
