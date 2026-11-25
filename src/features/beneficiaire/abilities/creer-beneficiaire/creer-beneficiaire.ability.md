# Fonctionnalité: Créer un bénéficiaire

## Règle: Un bénéficiaire identifié est créé pour le médiateur courant

### Scénario: Créer un bénéficiaire avec les informations minimales

* Quand je crée un bénéficiaire avec les données suivantes
  | Champ  | Valeur |
  | prenom | Jean   |
  | nom    | Dupont |
* Alors le bénéficiaire est créé avec les données suivantes
  | Champ   | Valeur |
  | prenom  | Jean   |
  | nom     | Dupont |
  | anonyme | false  |
* Et le compteur de bénéficiaires du médiateur est incrémenté de 1

## Règle: La tranche d'âge est dérivée de l'année de naissance, sinon la saisie est conservée

### Scénario: Avec une année de naissance, la tranche est calculée

* Quand je crée un bénéficiaire né en 1990
* Alors la tranche d'âge du bénéficiaire est "VingtCinqTrenteNeuf"

### Scénario: Sans année de naissance, la tranche saisie est conservée

* Quand je crée un bénéficiaire avec les données suivantes
  | Champ      | Valeur          |
  | prenom     | Marie           |
  | nom        | Curie           |
  | trancheAge | SoixanteDixPlus |
* Alors la tranche d'âge du bénéficiaire est "SoixanteDixPlus"

### Scénario: Sans année de naissance ni tranche saisie, la tranche est "NonCommunique"

* Quand je crée un bénéficiaire avec les données suivantes
  | Champ  | Valeur |
  | prenom | Marie  |
  | nom    | Curie  |
* Alors la tranche d'âge du bénéficiaire est "NonCommunique"
