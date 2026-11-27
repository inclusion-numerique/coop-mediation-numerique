export type AucuneUsurpationEnCours = {
  readonly _tag: 'AucuneUsurpationEnCours'
}

export const AucuneUsurpationEnCours = (): AucuneUsurpationEnCours => ({
  _tag: 'AucuneUsurpationEnCours',
})

export type UsurpateurNonAdministrateur = {
  readonly _tag: 'UsurpateurNonAdministrateur'
}

export const UsurpateurNonAdministrateur = (): UsurpateurNonAdministrateur => ({
  _tag: 'UsurpateurNonAdministrateur',
})

export type EchecDeTerminerLUsurpation =
  | AucuneUsurpationEnCours
  | UsurpateurNonAdministrateur
