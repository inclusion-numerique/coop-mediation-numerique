# Fonctionnalité: Rechercher des bénéficiaires

## Règle: La recherche est filtrée par médiateur et exclut les bénéficiaires demandés

### Scénario: Rechercher des bénéficiaires par nom

* Étant donné les bénéficiaires de recherche suivants
  | prenom | nom      |
  | Alice  | Testrech |
  | Bob    | Testrech |
* Quand je recherche "Testrech"
* Alors la recherche retourne 2 bénéficiaires

### Scénario: Exclure un bénéficiaire de la recherche

* Étant donné les bénéficiaires de recherche suivants
  | prenom | nom      |
  | Alice  | Testrech |
  | Bob    | Testrech |
* Quand je recherche "Testrech" en excluant le premier
* Alors la recherche retourne 1 bénéficiaire
