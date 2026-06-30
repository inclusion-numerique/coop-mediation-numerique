# Feature: Modifier un bénéficiaire

## Rule: Seul le médiateur propriétaire peut modifier son bénéficiaire

### Scenario: Modifier les informations d'un bénéficiaire existant

* Given un bénéficiaire "Jean Dupont" de ce médiateur
* When je modifie ce bénéficiaire avec les données suivantes
  | Champ  | Valeur |
  | prenom | Jeanne |
  | nom    | Durand |
* Then la modification réussit
* And le bénéficiaire porte désormais les données suivantes
  | Champ  | Valeur |
  | prenom | Jeanne |
  | nom    | Durand |

### Scenario: Modifier un bénéficiaire inexistant échoue

* When je modifie un bénéficiaire inexistant
* Then la modification échoue avec l'erreur "BeneficiaireNotFound"

## Rule: La date de création est préservée à la modification

### Scenario: La date de création reste inchangée

* Given un bénéficiaire "Jean Dupont" de ce médiateur
* When je modifie ce bénéficiaire avec les données suivantes
  | Champ  | Valeur |
  | prenom | Jeanne |
  | nom    | Dupont |
* Then la date de création du bénéficiaire est inchangée
