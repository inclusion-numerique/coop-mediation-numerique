import type { BilanDuDetachement, Detachement } from './detachement'

export type RetirerDesEquipes = (
  detachement: Detachement,
) => Promise<BilanDuDetachement>

export type DetacherDesEquipesPorts = {
  readonly retirerDesEquipes: RetirerDesEquipes
}
