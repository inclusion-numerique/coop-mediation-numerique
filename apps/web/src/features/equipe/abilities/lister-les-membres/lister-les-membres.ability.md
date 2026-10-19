# Feature: Lister les membres d'une équipe

## Background:

* Given une équipe composée d'un membre actif, d'un membre inactif, d'un ancien membre revenu, d'un ancien membre et d'une invitation en attente

## Rule: La liste montre chaque personne une seule fois, avec son statut

### Scenario: Le coordinateur consulte toute son équipe

* When le coordinateur consulte son équipe
* Then la liste compte 5 lignes
* And le médiateur revenu n'apparaît qu'une fois, comme membre actif

### Scenario: Les compteurs s'additionnent

> Un membre dont le profil a été supprimé rejoint les archives : le total ne
> compte que les membres actifs et inactifs.

* Given un membre dont le profil a été supprimé
* When le coordinateur consulte son équipe
* Then l'équipe compte 3 membres, dont 2 actifs et 1 inactif
* And 1 invitation est en attente
* And 2 personnes sont aux archives

### Scenario: Le coordinateur filtre les archives

* When le coordinateur consulte les archives de son équipe
* Then la liste compte 1 ligne
* And cette ligne est un ancien membre

## Rule: La recherche est un texte, jamais une instruction

### Scenario: Une recherche contenant des caractères spéciaux ne casse rien

* When le coordinateur cherche "x' OR '1'='1" dans son équipe
* Then la liste compte 0 ligne

### Scenario: La recherche trouve un membre par son email

* When le coordinateur cherche l'email du membre actif dans son équipe
* Then la liste compte 1 ligne

## Rule: Seuls les membres actifs, le coordinateur et les administrateurs consultent une équipe

### Scenario: Un membre actif consulte son équipe

* When le membre actif consulte son équipe
* Then la consultation réussit

### Scenario: Le coordinateur d'une autre équipe ne peut pas la consulter

* When le coordinateur d'une autre équipe consulte cette équipe
* Then la consultation est refusée
