# Feature: Créer un bénéficiaire

## Rule: Un bénéficiaire identifié est créé pour le médiateur courant

### Scenario: Créer un bénéficiaire avec les informations minimales

* When je crée un bénéficiaire avec les données suivantes
  | Champ  | Valeur |
  | prenom | Jean   |
  | nom    | Dupont |
* Then le bénéficiaire est créé avec les données suivantes
  | Champ   | Valeur |
  | prenom  | Jean   |
  | nom     | Dupont |
  | anonyme | false  |
* And le compteur de bénéficiaires du médiateur est incrémenté de 1

## Rule: La tranche d'âge est dérivée de l'année de naissance

### Scenario: Avec une année de naissance, la tranche est calculée

* When je crée un bénéficiaire né en 1990
* Then la tranche d'âge du bénéficiaire est "VingtCinqTrenteNeuf"

### Scenario: Sans année de naissance, la tranche est "NonCommunique"

* When je crée un bénéficiaire avec les données suivantes
  | Champ  | Valeur |
  | prenom | Marie  |
  | nom    | Curie  |
* Then la tranche d'âge du bénéficiaire est "NonCommunique"
