# Fonctionnalité: Terminer l'usurpation

> L'administrateur qui parcourt la coop à la place d'un compte récupère sa
> propre session. Seule une session usurpée se rend, et seulement à un
> usurpateur encore administrateur.

## Règle: La session revient à l'administrateur usurpateur

### Scénario: Terminer l'usurpation

* Étant donné une session usurpée par un administrateur
* Quand l'usurpation de cette session est terminée
* Alors la fin de l'usurpation aboutit
* Et la session est rendue à l'administrateur

## Règle: Seule une usurpation en cours, par un administrateur, se termine

### Scénario: Une session ordinaire n'a rien à terminer

* Étant donné une session sans usurpation
* Quand l'usurpation de cette session est terminée
* Alors la fin de l'usurpation échoue avec l'erreur "AucuneUsurpationEnCours"

### Scénario: Un usurpateur qui n'est plus administrateur ne récupère pas la session

* Étant donné une session usurpée par un ancien administrateur
* Quand l'usurpation de cette session est terminée
* Alors la fin de l'usurpation échoue avec l'erreur "UsurpateurNonAdministrateur"
