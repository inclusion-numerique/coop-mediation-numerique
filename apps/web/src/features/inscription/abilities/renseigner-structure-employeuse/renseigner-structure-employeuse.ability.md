# Feature: Renseigner sa structure employeuse

## Rule: Renseigner une structure la lie comme employeuse et marque l'étape franchie

### Scenario: Renseigner une structure employeuse

* When je renseigne ma structure employeuse
* Then ma structure employeuse est renseignée
* And je suis rattaché à cette structure comme employé

### Scenario: Remplacer une structure employeuse existante

* Given un emploi existe déjà dans une autre structure
* When je renseigne ma structure employeuse
* Then je suis rattaché à cette structure comme employé
* And le précédent emploi est rompu
