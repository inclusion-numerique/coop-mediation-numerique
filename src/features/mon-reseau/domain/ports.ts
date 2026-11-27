import type { CodeDepartement } from '@/libraries/insee'

export type CommunesDesLieux<Communes> = (options: {
  readonly departementCode: CodeDepartement
}) => Promise<Communes>
