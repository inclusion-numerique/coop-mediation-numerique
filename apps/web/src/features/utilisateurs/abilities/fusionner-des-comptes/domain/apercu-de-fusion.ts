import type {
  AdresseCourriel,
  NomAffiche,
  UtilisateurId,
} from '@app/web/features/utilisateurs/domain'

export const categoriesDeFusion = [
  'beneficiaires',
  'activites',
  'structuresEmployeuses',
  'lieuxActivite',
  'equipesRejointes',
  'mediateursCoordonnes',
  'invitationsRecues',
  'invitationsEnvoyees',
  'mutations',
  'tags',
] as const

export type CategorieDeFusion = (typeof categoriesDeFusion)[number]

export type ContenuDuCompte = Readonly<
  Record<CategorieDeFusion, readonly string[]>
>

export type CompteApercu = {
  readonly id: UtilisateurId
  readonly nom: NomAffiche
  readonly courriel: AdresseCourriel
  readonly supprimeLe: Date | null
  readonly contenu: ContenuDuCompte
}

export type ApercuDeFusion = {
  readonly source: CompteApercu
  readonly cible: CompteApercu
  readonly communs: ContenuDuCompte
}

export const communs = (
  source: ContenuDuCompte,
  cible: ContenuDuCompte,
): ContenuDuCompte => {
  const commun = (categorie: CategorieDeFusion): readonly string[] =>
    source[categorie].filter((id) => cible[categorie].includes(id))

  return {
    beneficiaires: commun('beneficiaires'),
    activites: commun('activites'),
    structuresEmployeuses: commun('structuresEmployeuses'),
    lieuxActivite: commun('lieuxActivite'),
    equipesRejointes: commun('equipesRejointes'),
    mediateursCoordonnes: commun('mediateursCoordonnes'),
    invitationsRecues: commun('invitationsRecues'),
    invitationsEnvoyees: commun('invitationsEnvoyees'),
    mutations: commun('mutations'),
    tags: commun('tags'),
  }
}
