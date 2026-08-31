/**
 * API publique de la feature équipe.
 *
 * La feature naît avec cette seule ability : rien de ce qui vit encore dans
 * `src/equipe/` (invitations, liste, export) n'a été déplacé ici. Ce n'est pas
 * un oubli — la migration se fait ability par ability, et celle-ci était la
 * première à avoir un propriétaire évident.
 */
export { libererDesEquipes } from './abilities/liberer-des-equipes'
