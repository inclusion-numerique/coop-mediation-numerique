import { ChiffresClesDesAccompagnements } from '../components/ChiffresClesDesAccompagnements'
import type { TotauxPresentes } from '../presenters/totaux.presenter'

export const BlocDesChiffresCles = async ({
  debut,
  fin,
  totaux,
}: {
  totaux: TotauxPresentes | Promise<TotauxPresentes>
  debut?: string
  fin?: string
}) => (
  <ChiffresClesDesAccompagnements
    totalCounts={await totaux}
    debut={debut}
    fin={fin}
  />
)
