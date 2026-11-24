/**
 * RDV Service Public ne distingue pas la chaîne vide de l'absence : 882 des
 * 44 627 rendez-vous portent une adresse vide, 2 280 des 23 087 usagers un
 * téléphone vide. Ramener ces valeurs à `null` à l'entrée du domaine évite qu'un
 * smart constructor ne jette au milieu d'une synchronisation et n'emporte tout
 * le lot — c'est exactement le scénario qui avait interrompu la synchro d'un
 * compte entier sur un numéro legacy.
 */
export const absentSiVide = (valeur: string | null): string | null =>
  valeur === null || valeur.trim() === '' ? null : valeur
