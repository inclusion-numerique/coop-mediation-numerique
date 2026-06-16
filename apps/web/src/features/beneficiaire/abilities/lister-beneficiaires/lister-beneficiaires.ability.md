# Feature: Lister les bénéficiaires

## Rule: La liste est filtrée par médiateur, recherchable et paginée

### Scenario: Rechercher les bénéficiaires par nom

* Given les bénéficiaires suivants pour ce médiateur
  | prenom | nom       |
  | Alice  | Testliste |
  | Bob    | Testliste |
* When je liste les bénéficiaires avec la recherche "Testliste"
* Then la liste contient 2 bénéficiaires
* And le nombre total de correspondances est 2

### Scenario: Affiner la recherche par prénom et nom

* Given les bénéficiaires suivants pour ce médiateur
  | prenom | nom       |
  | Alice  | Testliste |
  | Bob    | Testliste |
* When je liste les bénéficiaires avec la recherche "Alice Testliste"
* Then la liste contient 1 bénéficiaire

### Scenario: Paginer les résultats

* Given les bénéficiaires suivants pour ce médiateur
  | prenom | nom       |
  | Alice  | Testliste |
  | Bob    | Testliste |
* When je liste les bénéficiaires avec la recherche "Testliste" par pages de 1
* Then la liste contient 1 bénéficiaire
* And le nombre de pages est 2
