# Feature: Renseigner sa structure employeuse

Le rattachement lui-même appartient à la feature employeuse — c'est elle qui
décide de créer ou réutiliser la structure, et qui clôt le rattachement
précédent. Ces scénarios ne couvrent donc que ce que l'inscription décide :
quand rattacher, et ce qu'il faut conclure d'un échec.

## Rule: Renseigner une structure la rattache comme employeuse et marque l'étape franchie

### Scenario: Renseigner une structure employeuse

* Given j’ai choisi le profil "Mediateur"
* When je renseigne ma structure employeuse
* Then ma structure employeuse est renseignée
* And le rattachement à l’employeuse a été demandé

## Rule: L'étape n'est franchie que si le rattachement a abouti

### Scenario: L'employeuse choisie n'est pas rattachable

* Given j’ai choisi le profil "Mediateur"
* And l’employeuse choisie n’est pas rattachable
* When je renseigne ma structure employeuse
* Then le renseignement est refusé faute d’employeuse rattachable
* And ma structure employeuse n’est pas renseignée

## Rule: Une étape ne se franchit pas avant que le profil ne soit choisi

### Scenario: Renseigner sa structure avant d'avoir choisi son rôle

* When je renseigne ma structure employeuse
* Then le renseignement est refusé faute de profil choisi
* And ma structure employeuse n’est pas renseignée
* And aucun rattachement n’a été demandé
