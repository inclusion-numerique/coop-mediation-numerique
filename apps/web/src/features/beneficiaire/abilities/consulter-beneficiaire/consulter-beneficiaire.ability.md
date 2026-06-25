# Feature: Consulter un bénéficiaire

## Rule: Un médiateur consulte la fiche d'un de ses bénéficiaires

### Scenario: Consulter un bénéficiaire existant

* When je consulte un bénéficiaire enregistré avec les données suivantes
  | Champ  | Valeur   |
  | prenom | Ada      |
  | nom    | Lovelace |
* Then la consultation retourne le bénéficiaire avec les données suivantes
  | Champ  | Valeur   |
  | prenom | Ada      |
  | nom    | Lovelace |

### Scenario: Consulter un bénéficiaire inexistant ne retourne rien

* When je consulte un bénéficiaire inexistant
* Then la consultation ne retourne aucun bénéficiaire
