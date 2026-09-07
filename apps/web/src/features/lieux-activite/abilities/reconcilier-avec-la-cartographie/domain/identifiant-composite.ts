import {
  IdsCartographieNationale,
  serialiserIdsCartographieNationale,
} from '../../../domain/ids-cartographie-nationale'
import { LieuId } from '../../../domain/lieu-id'
import type { SourceCartographie } from '../../../domain/tracabilite'

/**
 * Un lieu de la cartographie nationale, tel que l'Entrepôt le décrit.
 *
 * Ses identifiants sont ceux de `IdsCartographieNationale` : quand plusieurs
 * sources décrivent le même endroit, la cartographie réunit leurs tokens sous
 * une seule fiche. Ceux de la coop portent le préfixe `Coop-numérique_`, suivi
 * de l'identifiant du lieu chez nous — ce sont eux que la réconciliation
 * cherche.
 */
export type LieuCarto = {
  readonly identifiantCartographie: IdsCartographieNationale
  readonly source: SourceCartographie | null
  readonly dateMaj: Date | null
}

/**
 * Les lieux de la coop que la cartographie a réunis sous un même identifiant.
 * Le premier survit à la fusion, les suivants lui cèdent leurs rattachements.
 */
export type LieuxCoopReunis = LieuCarto & {
  readonly coopIds: readonly LieuId[]
}

export const PREFIXE_COOP = 'Coop-numérique_'

/**
 * Les lieux de la coop qu'un identifiant composite désigne, sans doublon.
 *
 * Un token mal formé est écarté : la cartographie agrège des producteurs qui ne
 * garantissent rien de la forme, et une réconciliation d'une demi-heure ne doit
 * pas s'arrêter sur une chaîne qui ne ressemble pas à un identifiant.
 */
export const identifiantsCoop = (
  identifiantCartographie: IdsCartographieNationale,
): readonly LieuId[] =>
  Array.from(
    new Set(
      identifiantCartographie
        .filter((token) => token.startsWith(PREFIXE_COOP))
        .map((token) => token.slice(PREFIXE_COOP.length)),
    ),
  )
    .map(LieuId.safe)
    .filter((id) => id !== null)

/** La forme attendue par la colonne : les tokens recollés. */
export const identifiantEnColonne = ({
  identifiantCartographie,
}: LieuCarto): string =>
  serialiserIdsCartographieNationale(identifiantCartographie)

/**
 * Les lieux carto qui désignent au moins un lieu de la coop, regroupés. Ceux
 * qu'aucun token coop ne concerne sont écartés : la coop n'a rien à y relier.
 */
export const lieuxCoopReunis = (
  lieux: readonly LieuCarto[],
): readonly LieuxCoopReunis[] =>
  lieux.flatMap((lieu) => {
    const coopIds = identifiantsCoop(lieu.identifiantCartographie)

    return coopIds.length === 0 ? [] : [{ ...lieu, coopIds }]
  })
