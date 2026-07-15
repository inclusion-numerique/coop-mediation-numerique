# Feature: Renseigner sa structure employeuse

## Rule: Renseigner une structure la lie comme employeuse et marque l'étape franchie

### Scenario: Renseigner une structure employeuse

* Given j’ai choisi le profil "Mediateur"
* When je renseigne ma structure employeuse
* Then ma structure employeuse est renseignée
* And je suis rattaché à cette structure comme employé

### Scenario: Remplacer une structure employeuse existante

* Given j’ai choisi le profil "Mediateur"
* And un emploi existe déjà dans une autre structure
* When je renseigne ma structure employeuse
* Then je suis rattaché à cette structure comme employé
* And le précédent emploi est rompu

## Rule: Une étape ne se franchit pas avant que le profil ne soit choisi

### Scenario: Renseigner sa structure avant d'avoir choisi son rôle

* When je renseigne ma structure employeuse
* Then le renseignement est refusé faute de profil choisi
* And ma structure employeuse n’est pas renseignée
* And aucun emploi n’est créé
