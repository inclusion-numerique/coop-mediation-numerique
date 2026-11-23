import { CommunesDesAccompagnements } from '../components/CommunesDesAccompagnements'
import type { parCommunePresentes } from '../presenters/par-commune.presenter'

export const BlocDesCommunes = async ({
  communes,
}: {
  communes:
    | ReturnType<typeof parCommunePresentes>
    | Promise<ReturnType<typeof parCommunePresentes>>
}) => <CommunesDesAccompagnements communes={await communes} />
