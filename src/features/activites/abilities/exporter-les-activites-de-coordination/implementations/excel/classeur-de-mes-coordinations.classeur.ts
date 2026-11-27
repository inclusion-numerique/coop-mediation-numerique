import type {
  ActiviteDeCoordination,
  CriteresDesCoordinations,
  TagDeLActivite,
} from '../../../../domain'
import { classeurDesCoordinations } from './classeur-des-coordinations.classeur'

type Presenter = (donnees: {
  activites: readonly ActiviteDeCoordination[]
  criteres: CriteresDesCoordinations
  tags: readonly TagDeLActivite[]
  fuseau: string
}) => Omit<
  Parameters<typeof classeurDesCoordinations>[0],
  'auteur' | 'fuseau' | 'genereLe'
>

export const classeurDeMesCoordinations = ({
  activites,
  tags,
  criteres,
  auteur,
  fuseau,
  presenter,
  genereLe,
}: {
  readonly activites: readonly ActiviteDeCoordination[]
  readonly tags: readonly TagDeLActivite[]
  readonly criteres: CriteresDesCoordinations
  readonly auteur: Parameters<typeof classeurDesCoordinations>[0]['auteur']
  readonly fuseau: string
  readonly presenter: Presenter
  readonly genereLe: Date
}) =>
  classeurDesCoordinations({
    ...presenter({ activites, criteres, tags, fuseau }),
    auteur,
    fuseau,
    genereLe,
  })
