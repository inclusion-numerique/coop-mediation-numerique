/**
 * Vérifie l'intégrité d'une chaîne numérique selon la formule de Luhn : chaque
 * chiffre de rang pair en partant de la fin est doublé, un résultat à deux
 * chiffres est ramené en dessous de dix, et la somme doit être un multiple de
 * dix. C'est la clé de contrôle que porte tout SIRET.
 */
export const checkLuhnIntegrity = (numericString: string): boolean =>
  /^\d+$/.test(numericString) &&
  [...numericString]
    .reverse()
    .map((chiffre, rang) => {
      const double = Number.parseInt(chiffre, 10) * (rang % 2 === 1 ? 2 : 1)
      return double > 9 ? double - 9 : double
    })
    .reduce((somme, chiffre) => somme + chiffre, 0) %
    10 ===
    0
