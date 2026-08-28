import { useSyncExternalStore } from 'react'

const neverChanges = () => () => {
  // Rien à désabonner : la valeur bascule une seule fois, à l'hydratation.
}

/**
 * `false` pendant le rendu serveur et l'hydratation, `true` une fois la page
 * interactive.
 *
 * Les champs sont des composants contrôlés : tant que React n'a pas hydraté, un
 * clic coche bien l'input dans le DOM, mais le premier rendu client l'efface
 * sans que rien ne le signale. Un formulaire s'en sert donc pour rester
 * désactivé tant qu'une saisie serait perdue. Le chargement `lazy` des champs
 * élargit d'autant cette fenêtre.
 */
export const useHydrated = (): boolean =>
  useSyncExternalStore(
    neverChanges,
    () => true,
    () => false,
  )
