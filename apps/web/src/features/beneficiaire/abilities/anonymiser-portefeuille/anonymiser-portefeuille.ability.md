# Feature: Anonymiser le portefeuille d'un médiateur

## Rule: L'identité part, la valeur statistique reste

### Scenario: Le portefeuille entier est anonymisé

* Given un portefeuille de deux bénéficiaires identifiés
* When j'anonymise le portefeuille de ce médiateur
* Then l'anonymisation porte sur 2 bénéficiaires
* And les bénéficiaires du portefeuille n'ont plus d'identité
* And les bénéficiaires du portefeuille gardent leur valeur statistique
* And le compteur de bénéficiaires du portefeuille est remis à zéro

## Rule: Le lien vers l'usager RDV est rompu, ce qui le rend orphelinable

### Scenario: Le rattachement à l'usager RDV est détaché

* Given un portefeuille de deux bénéficiaires identifiés
* When j'anonymise le portefeuille de ce médiateur
* Then les bénéficiaires du portefeuille ne référencent plus d'usager RDV

## Rule: Rejouer l'anonymisation ne fait rien de plus

### Scenario: Une seconde anonymisation ne trouve plus rien

* Given un portefeuille de deux bénéficiaires identifiés
* When j'anonymise le portefeuille de ce médiateur
* And j'anonymise à nouveau le portefeuille de ce médiateur
* Then l'anonymisation porte sur 0 bénéficiaire
