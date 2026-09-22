import { type LieuAReprendre, type Reprise, reprise } from '../../../domain'

const COLONNE = 'publication'

const A_RETIRER = 'à retirer'

export type RetirerLaPublication = (lieuId: string) => Promise<void>

const laissePublieSansService = ({
  publie,
  services,
}: LieuAReprendre): true | null =>
  publie && services.length === 0 ? true : null

export const repriseDeLaPublication = (
  retirerLaPublication: RetirerLaPublication,
): Reprise =>
  reprise<true>({
    colonnes: [COLONNE],
    constater: laissePublieSansService,
    mentions: () => [
      {
        colonne: COLONNE,
        cellule: A_RETIRER,
        motif: `${COLONNE} : ${A_RETIRER}`,
      },
    ],
    appliquer: (lieuId) => retirerLaPublication(lieuId),
  })
