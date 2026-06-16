# Feature: Rechercher des bénéficiaires

## Rule: La recherche est filtrée par médiateur et exclut les bénéficiaires demandés

### Scenario: Rechercher des bénéficiaires par nom

* Given les bénéficiaires de recherche suivants
  | prenom | nom      |
  | Alice  | Testrech |
  | Bob    | Testrech |
* When je recherche "Testrech"
* Then la recherche retourne 2 bénéficiaires

### Scenario: Exclure un bénéficiaire de la recherche

* Given les bénéficiaires de recherche suivants
  | prenom | nom      |
  | Alice  | Testrech |
  | Bob    | Testrech |
* When je recherche "Testrech" en excluant le premier
* Then la recherche retourne 1 bénéficiaire
