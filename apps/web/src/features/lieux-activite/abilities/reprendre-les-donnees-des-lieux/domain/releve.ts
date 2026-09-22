import {
  type HorairesAReprendre,
  horairesAReprendre,
} from './horaires-a-reprendre'
import type { ColonneDeListe, LieuAReprendre } from './lieu-a-reprendre'
import { LISTES } from './lieu-a-reprendre'
import { colonnesATrier } from './listes-a-trier'

export type LieuAuReleve = {
  readonly lieuId: string
  readonly nom: string
  readonly commune: string
  readonly codePostal: string
  readonly publie: boolean
  readonly listesATrier: readonly ColonneDeListe[]
  readonly horaires: HorairesAReprendre | null
}

export type ColonneATrier = {
  readonly colonne: ColonneDeListe
  readonly lieux: number
}

export type ComptesDesHoraires = {
  readonly aCorriger: number
  readonly aDeplacer: number
}

export type Releve = {
  readonly lieuxMesures: number
  readonly lieux: readonly LieuAuReleve[]
}

const rienAFaire = ({ listesATrier, horaires }: LieuAuReleve): boolean =>
  listesATrier.length === 0 && horaires == null

const auReleve = (lieu: LieuAReprendre): LieuAuReleve => ({
  lieuId: lieu.id,
  nom: lieu.nom,
  commune: lieu.commune,
  codePostal: lieu.codePostal,
  publie: lieu.publie,
  listesATrier: colonnesATrier(lieu),
  horaires: horairesAReprendre(lieu),
})

export const relever = (lieux: readonly LieuAReprendre[]): Releve => ({
  lieuxMesures: lieux.length,
  lieux: lieux.map(auReleve).filter((lieu) => !rienAFaire(lieu)),
})

const compter = (
  lieux: readonly LieuAuReleve[],
  colonne: ColonneDeListe,
): ColonneATrier => ({
  colonne,
  lieux: lieux.filter(({ listesATrier }) => listesATrier.includes(colonne))
    .length,
})

const deLaPlusLourde = (gauche: ColonneATrier, droite: ColonneATrier): number =>
  droite.lieux - gauche.lieux

export const comptesParColonne = ({
  lieux,
}: Releve): readonly ColonneATrier[] =>
  LISTES.map((colonne) => compter(lieux, colonne))
    .filter(({ lieux: touches }) => touches > 0)
    .sort(deLaPlusLourde)

const porteLeVerdict =
  (verdict: HorairesAReprendre['verdict']) =>
  ({ horaires }: LieuAuReleve): boolean =>
    horaires?.verdict === verdict

export const comptesDesHoraires = ({ lieux }: Releve): ComptesDesHoraires => ({
  aCorriger: lieux.filter(porteLeVerdict('a-corriger')).length,
  aDeplacer: lieux.filter(porteLeVerdict('a-deplacer')).length,
})
