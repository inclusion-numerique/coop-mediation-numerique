# Fonctionnalité: Inscrire un compte à la liste de diffusion

> Un compte qui tient un rôle de la liste de diffusion y est inscrit avec ses
> rôles, par exemple à la validation de son inscription. Un compte qui n'en
> tient aucun n'y est pas inscrit.

## Règle: Seul un compte qui tient un rôle de la liste y est inscrit

### Scénario: Un médiateur est inscrit avec son rôle

* Étant donné un médiateur à inscrire à la liste de diffusion
* Quand je l'inscris à la liste de diffusion
* Alors son contact est inscrit avec le rôle "Mediateur"

### Scénario: Un compte sans rôle de la liste n'est pas inscrit

* Étant donné un compte sans rôle à inscrire à la liste de diffusion
* Quand je l'inscris à la liste de diffusion
* Alors aucun contact n'est inscrit à la liste de diffusion
