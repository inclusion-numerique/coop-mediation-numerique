# Feature: Terminer l'usurpation

> L'administrateur qui parcourt la coop à la place d'un compte récupère sa
> propre session. Seule une session usurpée se rend, et seulement à un
> usurpateur encore administrateur.

## Rule: La session revient à l'administrateur usurpateur

### Scenario: Terminer l'usurpation

* Given une session usurpée par un administrateur
* When l'usurpation de cette session est terminée
* Then la fin de l'usurpation aboutit
* And la session est rendue à l'administrateur

## Rule: Seule une usurpation en cours, par un administrateur, se termine

### Scenario: Une session ordinaire n'a rien à terminer

* Given une session sans usurpation
* When l'usurpation de cette session est terminée
* Then la fin de l'usurpation échoue avec l'erreur "AucuneUsurpationEnCours"

### Scenario: Un usurpateur qui n'est plus administrateur ne récupère pas la session

* Given une session usurpée par un ancien administrateur
* When l'usurpation de cette session est terminée
* Then la fin de l'usurpation échoue avec l'erreur "UsurpateurNonAdministrateur"
