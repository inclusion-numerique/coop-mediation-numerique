import type { CriteresDesActivites } from '../../../../domain'
import type {
  ExportDesAccompagnements,
  NomsDesFiltresExportes,
} from '../../domain'
import { classeurDesAccompagnements } from './classeur-des-accompagnements.classeur'

type Presenter = (donnees: {
  readonly criteres: CriteresDesActivites
  readonly noms: NomsDesFiltresExportes
  readonly exportDes: ExportDesAccompagnements
  readonly fuseau: string
}) => Pick<
  Parameters<typeof classeurDesAccompagnements>[0],
  'filtres' | 'entetes' | 'lignes' | 'total'
>

export const classeurDeMesAccompagnements = ({
  criteres,
  noms,
  exportDes,
  auteur,
  fuseau,
  presenter,
  date,
}: {
  readonly criteres: CriteresDesActivites
  readonly noms: NomsDesFiltresExportes
  readonly exportDes: ExportDesAccompagnements
  readonly auteur: Parameters<typeof classeurDesAccompagnements>[0]['demandeur']
  readonly fuseau: string
  readonly presenter: Presenter
  readonly date: Date
}) =>
  classeurDesAccompagnements({
    demandeur: auteur,
    ...presenter({ criteres, noms, exportDes, fuseau }),
    fuseau,
    date,
  })
