export const messageDErreurDeConnexion = (
  error?: string,
): string | undefined => {
  if (!error) {
    return error
  }

  if (error === 'OAuthAccountNotLinked') {
    return 'Vous venez de vous connecter par un nouvelle méthode. Par sécurité, veuillez utiliser la méthode de connexion que vous avez utilisé initialement.'
  }
  return 'Erreur de connexion, veuillez réessayer.'
}

export const connexionImpossibleMessage = (error?: string): string =>
  error === 'Verification'
    ? "Le lien de connexion n'est plus valide. Il a peut-être déjà été utilisé ou est expiré."
    : 'Une erreur est survenue lors de la connexion. Veuillez réessayer.'
