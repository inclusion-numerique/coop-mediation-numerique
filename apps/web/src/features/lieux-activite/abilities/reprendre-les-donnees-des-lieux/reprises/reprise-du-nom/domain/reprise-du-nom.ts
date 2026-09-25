import { Nom, nettoyerNom } from '@gouvfr-anct/lieux-de-mediation-numerique'
import type { LieuAReprendre, Reprise } from '../../../domain'
import { reprise } from '../../../domain'

const COLONNE = 'nom'

const A_CORRIGER = 'à corriger'

export type NomAReprendre = { readonly corrige: Nom }

export type ReprendreLeNom = (lieuId: string, nom: Nom) => Promise<void>

export const nomAReprendre = (lieu: LieuAReprendre): NomAReprendre | null => {
  const nettoye = nettoyerNom(lieu.nom)

  if (nettoye === lieu.nom) return null

  const corrige = Nom.safe(nettoye)

  return corrige == null ? null : { corrige }
}

export const repriseDuNom = (reprendreLeNom: ReprendreLeNom): Reprise =>
  reprise<NomAReprendre>({
    colonnes: [COLONNE],
    constater: nomAReprendre,
    mentions: () => [
      {
        colonne: COLONNE,
        cellule: A_CORRIGER,
        motif: `${COLONNE} : ${A_CORRIGER}`,
      },
    ],
    appliquer: (lieuId, { corrige }) => reprendreLeNom(lieuId, corrige),
  })
