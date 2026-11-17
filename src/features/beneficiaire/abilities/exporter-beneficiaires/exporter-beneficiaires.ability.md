# Feature: Exporter les bénéficiaires

## Rule: L'export reprend les bénéficiaires du médiateur correspondant à la recherche

### Scenario: Exporter les bénéficiaires correspondant à une recherche

* Given des bénéficiaires à exporter pour ce médiateur
  | prenom  | nom    |
  | Zexport | AlphaA |
  | Zexport | BetaB  |
* When je génère le classeur des bénéficiaires avec la recherche "Zexport"
* Then le classeur exporté contient 2 bénéficiaires
* And le classeur exporté contient "AlphaA"
* And le classeur exporté contient "BetaB"

### Scenario: La recherche filtre les bénéficiaires exportés

* Given des bénéficiaires à exporter pour ce médiateur
  | prenom  | nom   |
  | Zexport | Garde |
  | Autre   | Exclu |
* When je génère le classeur des bénéficiaires avec la recherche "Zexport"
* Then le classeur exporté contient 1 bénéficiaire
* And le classeur exporté contient "Garde"
* And le classeur exporté ne contient pas "Exclu"
