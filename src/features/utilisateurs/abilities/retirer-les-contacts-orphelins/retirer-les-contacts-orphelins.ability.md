# Fonctionnalité: Retirer les contacts orphelins

> La liste de diffusion Brevo ne doit contenir que des inscrits vivants. Un
> contact anonymisé par l'effacement est supprimé ; un contact dont le compte
> n'existe plus, ou n'est pas inscrit, est retiré de la liste.

## Règle: Seuls les inscrits vivants restent dans la liste

### Scénario: Les contacts sans inscrit vivant sont retirés

* Étant donné un inscrit vivant présent dans la liste de diffusion
* Et un contact anonymisé et un contact dont le compte n'existe plus
* Quand les contacts orphelins sont retirés
* Alors le contact anonymisé est supprimé
* Et le contact sans compte est retiré de la liste
* Et le contact de l'inscrit vivant reste dans la liste

### Scénario: Un contact déjà sorti de la liste n'est pas compté comme retiré

* Étant donné un contact dont le compte n'existe plus, déjà sorti de la liste
* Quand les contacts orphelins sont retirés
* Alors aucun contact n'est compté comme retiré
