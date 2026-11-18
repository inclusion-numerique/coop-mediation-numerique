# Feature: Consulter l'accueil

## Rule: L'accueil salue par le prénom, à défaut par le nom, à défaut par l'adresse électronique

### Scenario: Le prénom est connu

* Given une médiatrice prénommée "Camille", nommée "Camille Martin", d'adresse "camille@example.org"
* When elle consulte l'accueil
* Then l'accueil la salue par "Camille"

### Scenario: Seul le nom est connu

* Given une médiatrice prénommée " ", nommée "Camille Martin", d'adresse "camille@example.org"
* When elle consulte l'accueil
* Then l'accueil la salue par "Camille Martin"

### Scenario: Seule l'adresse électronique est connue

* Given une médiatrice prénommée "", nommée "", d'adresse "camille@example.org"
* When elle consulte l'accueil
* Then l'accueil la salue par "camille@example.org"

## Rule: Un coordinateur voit l'accueil de la coordination, même s'il est aussi médiateur

### Scenario: Coordinateur et médiateur

* Given un coordinateur qui est aussi médiateur
* When il consulte l'accueil
* Then l'accueil est celui d'un coordinateur

## Rule: Un médiateur est accueilli tant qu'il n'a pas vu la présentation de la Coop

### Scenario: Présentation pas encore vue

* Given une médiatrice qui n'a pas vu la présentation
* When elle consulte l'accueil
* Then l'accueil est celui d'un médiateur
* And l'accueil lui souhaite la bienvenue

### Scenario: Présentation déjà vue

* Given une médiatrice qui a vu la présentation
* When elle consulte l'accueil
* Then l'accueil est celui d'un médiateur
* And l'accueil ne lui souhaite plus la bienvenue
