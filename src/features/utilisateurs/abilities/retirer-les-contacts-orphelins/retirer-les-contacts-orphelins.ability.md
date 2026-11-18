# Feature: Retirer les contacts orphelins

> La liste de diffusion Brevo ne doit contenir que des inscrits vivants. Un
> contact anonymisé par l'effacement est supprimé ; un contact dont le compte
> n'existe plus, ou n'est pas inscrit, est retiré de la liste.

## Rule: Seuls les inscrits vivants restent dans la liste

### Scenario: Les contacts sans inscrit vivant sont retirés

* Given un inscrit vivant présent dans la liste de diffusion
* And un contact anonymisé et un contact dont le compte n'existe plus
* When les contacts orphelins sont retirés
* Then le contact anonymisé est supprimé
* And le contact sans compte est retiré de la liste
* And le contact de l'inscrit vivant reste dans la liste

### Scenario: Un contact déjà sorti de la liste n'est pas compté comme retiré

* Given un contact dont le compte n'existe plus, déjà sorti de la liste
* When les contacts orphelins sont retirés
* Then aucun contact n'est compté comme retiré
