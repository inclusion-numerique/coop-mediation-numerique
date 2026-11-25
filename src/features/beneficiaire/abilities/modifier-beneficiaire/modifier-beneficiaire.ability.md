# Fonctionnalité: Modifier un bénéficiaire

## Règle: Seul le médiateur propriétaire peut modifier son bénéficiaire

### Scénario: Modifier les informations d'un bénéficiaire existant

* Étant donné un bénéficiaire "Jean Dupont" de ce médiateur
* Quand je modifie ce bénéficiaire avec les données suivantes
  | Champ  | Valeur |
  | prenom | Jeanne |
  | nom    | Durand |
* Alors la modification réussit
* Et le bénéficiaire porte désormais les données suivantes
  | Champ  | Valeur |
  | prenom | Jeanne |
  | nom    | Durand |

### Scénario: Modifier un bénéficiaire inexistant échoue

* Quand je modifie un bénéficiaire inexistant
* Alors la modification échoue avec l'erreur "BeneficiaireNotFound"

## Règle: La tranche d'âge saisie sans année de naissance est conservée

### Scénario: Renseigner la tranche d'âge sans année de naissance

* Étant donné un bénéficiaire "Jean Dupont" de ce médiateur
* Quand je modifie ce bénéficiaire avec les données suivantes
  | Champ      | Valeur          |
  | prenom     | Jean            |
  | nom        | Dupont          |
  | trancheAge | SoixanteDixPlus |
* Alors la modification réussit
* Et le bénéficiaire porte désormais les données suivantes
  | Champ      | Valeur          |
  | trancheAge | SoixanteDixPlus |

## Règle: La date de création est préservée à la modification

### Scénario: La date de création reste inchangée

* Étant donné un bénéficiaire "Jean Dupont" de ce médiateur
* Quand je modifie ce bénéficiaire avec les données suivantes
  | Champ  | Valeur |
  | prenom | Jeanne |
  | nom    | Dupont |
* Alors la date de création du bénéficiaire est inchangée
