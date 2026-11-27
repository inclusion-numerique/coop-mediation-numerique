# Fonctionnalité: Apercevoir la fusion de deux comptes

> Avant de fusionner, l'administration voit côte à côte le compte en double
> (la source) et celui qu'on garde (la cible), avec ce que chacun porte et ce
> qu'ils ont en commun.

## Règle: L'aperçu montre ce que porte chaque compte

### Scénario: Apercevoir la fusion de deux médiateurs

* Étant donné deux comptes dont la fusion est à apercevoir
* Quand l'administration aperçoit la fusion de la source dans la cible
* Alors l'aperçu montre le bénéficiaire et l'activité de la source
* Et l'aperçu ne relève rien en commun aux deux comptes

## Règle: Les deux comptes doivent exister

### Scénario: La source n'existe pas

* Étant donné deux comptes dont la fusion est à apercevoir
* Quand l'administration aperçoit la fusion d'un compte inexistant dans la cible
* Alors l'aperçu de la fusion échoue avec l'erreur "SourceIntrouvable"
