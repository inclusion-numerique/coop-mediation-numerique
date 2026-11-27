# Fonctionnalité: Consulter l'accueil

## Règle: L'accueil salue par le prénom, à défaut par le nom, à défaut par l'adresse électronique

### Scénario: Le prénom est connu

* Étant donné une médiatrice prénommée "Camille", nommée "Camille Martin"
* Quand elle consulte l'accueil
* Alors l'accueil la salue par "Camille"

### Scénario: Seul le nom est connu

* Étant donné une médiatrice prénommée " ", nommée "Camille Martin"
* Quand elle consulte l'accueil
* Alors l'accueil la salue par "Camille Martin"

### Scénario: Seule l'adresse électronique est connue

* Étant donné une médiatrice prénommée "", nommée ""
* Quand elle consulte l'accueil
* Alors l'accueil la salue par son adresse électronique

## Règle: Un coordinateur voit l'accueil de la coordination, même s'il est aussi médiateur

### Scénario: Coordinateur et médiateur

* Étant donné un coordinateur qui est aussi médiateur
* Quand il consulte l'accueil
* Alors l'accueil est celui d'un coordinateur

## Règle: Un médiateur est accueilli tant qu'il n'a pas vu la présentation de la Coop

### Scénario: Présentation pas encore vue

* Étant donné une médiatrice qui n'a pas vu la présentation
* Quand elle consulte l'accueil
* Alors l'accueil est celui d'un médiateur
* Et l'accueil lui souhaite la bienvenue

### Scénario: Présentation déjà vue

* Étant donné une médiatrice qui a vu la présentation
* Quand elle consulte l'accueil
* Alors l'accueil est celui d'un médiateur
* Et l'accueil ne lui souhaite plus la bienvenue
