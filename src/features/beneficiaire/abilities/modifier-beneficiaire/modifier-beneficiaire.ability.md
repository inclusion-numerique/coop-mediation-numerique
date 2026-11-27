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

### Scénario: Modifier le bénéficiaire d'un autre médiateur échoue

* Étant donné un bénéficiaire enregistré pour un autre médiateur
* Quand je modifie le bénéficiaire de l'autre médiateur
* Alors la modification échoue avec l'erreur "BeneficiaireNotFound"
* Et le bénéficiaire de l'autre médiateur garde son identité

### Scénario: L'écriture de la modification n'atteint pas le bénéficiaire d'un autre médiateur

* Étant donné un bénéficiaire enregistré pour un autre médiateur
* Quand l'écriture de la modification vise le bénéficiaire de l'autre médiateur au nom de ce médiateur
* Alors l'écriture de la modification est refusée
* Et le bénéficiaire de l'autre médiateur garde son identité

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
