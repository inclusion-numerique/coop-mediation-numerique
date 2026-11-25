# Fonctionnalité: Exporter les bénéficiaires

## Règle: L'export reprend les bénéficiaires du médiateur correspondant à la recherche

### Scénario: Exporter les bénéficiaires correspondant à une recherche

* Étant donné des bénéficiaires à exporter pour ce médiateur
  | prenom  | nom    |
  | Zexport | AlphaA |
  | Zexport | BetaB  |
* Quand je génère le classeur des bénéficiaires avec la recherche "Zexport"
* Alors le classeur exporté contient 2 bénéficiaires
* Et le classeur exporté contient "AlphaA"
* Et le classeur exporté contient "BetaB"

### Scénario: La recherche filtre les bénéficiaires exportés

* Étant donné des bénéficiaires à exporter pour ce médiateur
  | prenom  | nom   |
  | Zexport | Garde |
  | Autre   | Exclu |
* Quand je génère le classeur des bénéficiaires avec la recherche "Zexport"
* Alors le classeur exporté contient 1 bénéficiaire
* Et le classeur exporté contient "Garde"
* Et le classeur exporté ne contient pas "Exclu"
