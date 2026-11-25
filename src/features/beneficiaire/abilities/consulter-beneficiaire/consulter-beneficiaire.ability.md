# Fonctionnalité: Consulter un bénéficiaire

## Règle: Un médiateur consulte la fiche d'un de ses bénéficiaires

### Scénario: Consulter un bénéficiaire existant

* Quand je consulte un bénéficiaire enregistré avec les données suivantes
  | Champ  | Valeur   |
  | prenom | Ada      |
  | nom    | Lovelace |
* Alors la consultation retourne le bénéficiaire avec les données suivantes
  | Champ  | Valeur   |
  | prenom | Ada      |
  | nom    | Lovelace |

### Scénario: Consulter un bénéficiaire inexistant ne retourne rien

* Quand je consulte un bénéficiaire inexistant
* Alors la consultation ne retourne aucun bénéficiaire
