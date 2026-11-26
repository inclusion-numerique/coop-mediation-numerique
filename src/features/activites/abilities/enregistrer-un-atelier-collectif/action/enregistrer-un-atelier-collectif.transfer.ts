import type { ActiviteId } from '../../../domain'

export type AtelierEnregistre = {
  readonly id: ActiviteId
  readonly type: 'Collectif'
}

export const atelierEnregistre = ({
  ecriture,
}: {
  readonly ecriture: { readonly activite: { readonly id: ActiviteId } }
}): AtelierEnregistre => ({
  id: ecriture.activite.id,
  type: 'Collectif',
})
