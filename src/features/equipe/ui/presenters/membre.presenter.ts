import { type LigneEquipe, profilDe } from '../../domain/index'

export const nomAffiche = (ligne: LigneEquipe): string => {
  const profil = profilDe(ligne)
  return [profil?.prenom, profil?.nom].filter(Boolean).join(' ') || ligne.email
}
