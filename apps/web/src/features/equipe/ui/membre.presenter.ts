import { type LigneEquipe, profilDe } from '../domain'

export const nomAffiche = (ligne: LigneEquipe): string => {
  const profil = profilDe(ligne)
  return [profil?.prenom, profil?.nom].filter(Boolean).join(' ') || ligne.email
}
