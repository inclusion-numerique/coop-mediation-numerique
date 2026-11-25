import { LieuxDesAccompagnements } from '../components/LieuxDesAccompagnements'
import type { parLieuPresentes } from '../presenters/par-lieu.presenter'

export const BlocDesLieux = async ({
  structures,
}: {
  structures:
    | ReturnType<typeof parLieuPresentes>
    | Promise<ReturnType<typeof parLieuPresentes>>
}) => <LieuxDesAccompagnements structures={await structures} />
