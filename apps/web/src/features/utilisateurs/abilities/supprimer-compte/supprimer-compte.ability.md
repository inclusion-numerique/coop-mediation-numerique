# Feature: Supprimer un compte

## Rule: L'effacement coupe l'accès et efface l'identité, en une seule fois

### Scenario: Le titulaire supprime son compte

* Given un compte médiateur avec des données rattachées
* When le titulaire supprime son compte
* Then l'effacement du compte aboutit
* And l'identité du compte est anonymisée
* And les sessions du compte sont supprimées
* And la liaison au fournisseur d'identité est supprimée
* And le constat d'effacement est complet

## Rule: Une personne dont le compte est supprimé ne peut plus le retrouver

> L'identifiant ProConnect permet de retrouver l'adresse mail, donc la
> personne : le garder rendrait l'anonymisation incomplète. Une personne qui
> revient recrée un compte et repasse par l'inscription.

### Scenario: Une reconnexion ProConnect ne retrouve pas le compte supprimé

* Given un compte médiateur avec des données rattachées
* When le titulaire supprime son compte
* Then une reconnexion ProConnect ne retrouve plus le compte

## Rule: Les données rattachées au compte sont effacées chez leur propriétaire

### Scenario: Le portefeuille, les comptes rendus et les rattachements sont traités

* Given un compte médiateur avec des données rattachées
* When le titulaire supprime son compte
* Then le portefeuille de bénéficiaires est anonymisé
* And le texte libre des comptes rendus est effacé
* And les comptes rendus du compte existent toujours
* And les rattachements aux lieux d'activité sont coupés
* And le partage de statistiques est révoqué

## Rule: Un rôle protégé ne s'efface pas

### Scenario: Un administrateur ne peut pas supprimer son propre compte

* Given un compte administrateur
* When le titulaire supprime son compte
* Then l'effacement du compte échoue avec l'erreur "RoleProtege"

## Rule: Le titulaire n'efface pas deux fois, l'administration peut reprendre

### Scenario: Le titulaire ne peut pas supprimer un compte déjà supprimé

* Given un compte médiateur avec des données rattachées
* And le compte a déjà été supprimé
* When le titulaire supprime son compte
* Then l'effacement du compte échoue avec l'erreur "CompteDejaSupprime"

### Scenario: Un administrateur peut rejouer l'effacement d'un compte déjà supprimé

* Given un compte médiateur avec des données rattachées
* And le compte a déjà été supprimé
* When un administrateur supprime ce compte
* Then l'effacement du compte aboutit
* And l'identité du compte est anonymisée
* And la liaison au fournisseur d'identité est supprimée

### Scenario: Le rejeu ne réattribue pas une nouvelle identité anonyme

> L'empreinte se calcule sur le courriel courant : la recalculer au rejeu, alors
> qu'il vaut déjà `deleted+…`, donnerait une adresse différente à chaque passage.

* Given un compte médiateur avec des données rattachées
* When le titulaire supprime son compte
* And un administrateur rejoue l'effacement de ce compte
* Then l'identité anonyme du compte est inchangée
* And la liaison au fournisseur d'identité est supprimée
