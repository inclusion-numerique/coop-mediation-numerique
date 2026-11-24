export const CREER_A_LA_MAIN =
  'Merci de choisir « Créer un lieu d’activité » et de renseigner l’adresse à la main.'

export const SANS_SIRET_A_LA_MAIN =
  'Merci de sélectionner « Il n’y a pas de SIRET pour ce lieu » et de renseigner l’adresse à la main.'

type AdresseSaisie = {
  readonly adresse: string
  readonly codePostal: string
  readonly commune: string
}

export const adresseNonVerifiableMessage = (
  { adresse, codePostal, commune }: AdresseSaisie,
  consigne: string,
): string =>
  `L’adresse « ${adresse} ${codePostal} ${commune} » de cet établissement est introuvable dans la Base Adresse Nationale. ${consigne}`
