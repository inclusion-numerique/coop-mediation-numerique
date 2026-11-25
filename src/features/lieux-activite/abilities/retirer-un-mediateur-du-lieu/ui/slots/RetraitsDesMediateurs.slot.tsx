import type { ReactNode } from 'react'
import type { LieuId } from '../../../../domain/identifiants/lieu-id'
import type { MediateurId } from '../../../../domain/identifiants/mediateur-id'
import {
  type DernierPassage,
  dateDuDernierPassage,
} from '../presenters/retrait.presenter'
import BoutonDeRetrait from './BoutonDeRetrait.slot'

export type MediateurARetirer = {
  readonly rattachementId: string
  readonly mediateurId: MediateurId
  readonly nomAffiche: string
  readonly derniereActiviteIci: DernierPassage
}

export const retraitsDesMediateurs = (
  lieu: { readonly id: LieuId; readonly nom: string },
  mediateurs: readonly MediateurARetirer[],
): Readonly<Record<string, ReactNode>> =>
  Object.fromEntries(
    mediateurs.map((mediateur) => [
      mediateur.rattachementId,
      <BoutonDeRetrait
        key={mediateur.rattachementId}
        structureId={lieu.id}
        mediateurId={mediateur.mediateurId}
        mediateurDisplayName={mediateur.nomAffiche}
        structureNom={lieu.nom}
        derniereActiviteDate={dateDuDernierPassage(
          mediateur.derniereActiviteIci,
        )}
        variant="mediateur"
      />,
    ]),
  )
