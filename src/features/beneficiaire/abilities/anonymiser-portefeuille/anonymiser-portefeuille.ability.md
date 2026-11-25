# Fonctionnalité: Anonymiser le portefeuille d'un médiateur

## Règle: L'identité part, la valeur statistique reste

### Scénario: Le portefeuille entier est anonymisé

* Étant donné un portefeuille de deux bénéficiaires identifiés
* Quand j'anonymise le portefeuille de ce médiateur
* Alors l'anonymisation porte sur 2 bénéficiaires
* Et les bénéficiaires du portefeuille n'ont plus d'identité
* Et les bénéficiaires du portefeuille gardent leur valeur statistique
* Et le compteur de bénéficiaires du portefeuille est remis à zéro

### Scénario: Une commune à plusieurs codes postaux n'en garde qu'un

* Étant donné un portefeuille de deux bénéficiaires de Nice
* Quand j'anonymise le portefeuille de ce médiateur
* Alors les bénéficiaires du portefeuille ne gardent que le code postal "06100"

## Règle: Le lien vers l'usager RDV est rompu, ce qui le rend orphelinable

### Scénario: Le rattachement à l'usager RDV est détaché

* Étant donné un portefeuille de deux bénéficiaires identifiés
* Quand j'anonymise le portefeuille de ce médiateur
* Alors les bénéficiaires du portefeuille ne référencent plus d'usager RDV

## Règle: Rejouer l'anonymisation ne fait rien de plus

### Scénario: Une seconde anonymisation ne trouve plus rien

* Étant donné un portefeuille de deux bénéficiaires identifiés
* Quand j'anonymise le portefeuille de ce médiateur
* Et j'anonymise à nouveau le portefeuille de ce médiateur
* Alors l'anonymisation porte sur 0 bénéficiaire
