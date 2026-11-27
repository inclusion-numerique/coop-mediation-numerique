import type { ActiviteId } from '../../../domain'

export type AccompagnementEnregistre = {
  readonly id: ActiviteId
  readonly type: 'Individuel'
}

export const accompagnementEnregistre = ({
  ecriture,
}: {
  readonly ecriture: { readonly activite: { readonly id: ActiviteId } }
}): AccompagnementEnregistre => ({
  id: ecriture.activite.id,
  type: 'Individuel',
})
