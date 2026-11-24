import type { TypeDePortee } from '../../domain'
import type { EquipeAffichee } from './equipe-affichee.presenter'

const APPARENCE: Record<TypeDePortee, { libelle: string; classe: string }> = {
  Personnel: { libelle: 'Tag personnel', classe: 'fr-text-mention--grey' },
  Equipe: { libelle: 'Tag d’équipe', classe: 'fr-badge--brown-caramel' },
  Departemental: { libelle: 'Tag départemental', classe: 'fr-badge--info' },
  National: { libelle: 'Tag national', classe: 'fr-badge--green-menthe' },
}

export type BadgeDePortee = {
  readonly libelle: string
  readonly classe: string
  readonly infobulle: string | null
}

export const badgeDePortee = (
  portee: TypeDePortee,
  equipe: EquipeAffichee | null,
): BadgeDePortee => {
  const { libelle, classe } = APPARENCE[portee]
  return equipe === null
    ? { libelle, classe, infobulle: null }
    : {
        libelle: `${libelle} ${equipe.numero}`,
        classe,
        infobulle: `Équipe ${equipe.numero} - Coordonnée par ${equipe.coordonneePar}`,
      }
}
