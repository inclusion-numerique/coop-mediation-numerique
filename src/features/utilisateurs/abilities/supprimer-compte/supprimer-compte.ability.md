# Fonctionnalité: Supprimer un compte

## Règle: L'effacement coupe l'accès et efface l'identité, en une seule fois

### Scénario: Le titulaire supprime son compte

* Étant donné un compte médiateur avec des données rattachées
* Quand le titulaire supprime son compte
* Alors l'effacement du compte aboutit
* Et l'identité du compte est anonymisée
* Et les sessions du compte sont supprimées
* Et la liaison au fournisseur d'identité est supprimée
* Et le constat d'effacement est complet

## Règle: Une personne dont le compte est supprimé ne peut plus le retrouver

> L'identifiant ProConnect permet de retrouver l'adresse mail, donc la
> personne : le garder rendrait l'anonymisation incomplète. Une personne qui
> revient recrée un compte et repasse par l'inscription.

### Scénario: Une reconnexion ProConnect ne retrouve pas le compte supprimé

* Étant donné un compte médiateur avec des données rattachées
* Quand le titulaire supprime son compte
* Alors une reconnexion ProConnect ne retrouve plus le compte

## Règle: Les données rattachées au compte sont effacées chez leur propriétaire

### Scénario: Chaque propriétaire est appelé à effacer les données du compte

* Étant donné un compte médiateur avec des données rattachées
* Quand le titulaire supprime son compte
* Alors l'anonymisation du portefeuille est demandée pour ce médiateur
* Et l'effacement des comptes rendus est demandé pour ce médiateur
* Et le retrait des lieux d'activité est demandé pour ce médiateur
* Et la révocation du partage de statistiques est demandée pour ce médiateur
* Et l'effacement de l'empreinte RDV est demandé pour ce compte

## Règle: Un rôle protégé ne s'efface pas

### Scénario: Un administrateur ne peut pas supprimer son propre compte

* Étant donné un compte administrateur
* Quand le titulaire supprime son compte
* Alors l'effacement du compte échoue avec l'erreur "RoleProtege"

## Règle: Un conseiller numérique ne supprime pas lui-même son compte tant que son contrat court

> Un conseiller numérique est tenu d'utiliser la Coop pendant son contrat.
> Après la rupture, il ne relève plus du dispositif et peut supprimer son compte.

### Scénario: Le conseiller numérique sous contrat ne peut pas supprimer son compte

* Étant donné un compte conseiller numérique sous contrat
* Quand le titulaire supprime son compte
* Alors l'effacement du compte échoue avec l'erreur "SuppressionReserveeAuDispositif"
* Et l'identité du compte est intacte

### Scénario: Un administrateur peut supprimer le compte d'un conseiller numérique

* Étant donné un compte conseiller numérique sous contrat
* Quand un administrateur supprime ce compte
* Alors l'effacement du compte aboutit
* Et l'identité du compte est anonymisée

## Règle: La politique de rétention efface comme l'administration

### Scénario: La politique de rétention supprime un compte

* Étant donné un compte médiateur avec des données rattachées
* Quand la politique de rétention supprime ce compte
* Alors l'effacement du compte aboutit
* Et l'identité du compte est anonymisée
* Et la liaison au fournisseur d'identité est supprimée

## Règle: On ne supprime que ce qui existe

### Scénario: Un compte introuvable n'est pas supprimé

* Quand un administrateur supprime un compte qui n’existe pas
* Alors l'effacement du compte échoue avec l'erreur "CompteIntrouvable"

## Règle: Le titulaire n'efface pas deux fois, l'administration peut reprendre

### Scénario: Le titulaire ne peut pas supprimer un compte déjà supprimé

* Étant donné un compte médiateur avec des données rattachées
* Et le compte a déjà été supprimé
* Quand le titulaire supprime son compte
* Alors l'effacement du compte échoue avec l'erreur "CompteDejaSupprime"

### Scénario: Un administrateur peut rejouer l'effacement d'un compte déjà supprimé

* Étant donné un compte médiateur avec des données rattachées
* Et le compte a déjà été supprimé
* Quand un administrateur supprime ce compte
* Alors l'effacement du compte aboutit
* Et l'identité du compte est anonymisée
* Et la liaison au fournisseur d'identité est supprimée

### Scénario: Le rejeu ne réattribue pas une nouvelle identité anonyme

> L'empreinte se calcule sur le courriel courant : la recalculer au rejeu, alors
> qu'il vaut déjà `deleted+…`, donnerait une adresse différente à chaque passage.

* Étant donné un compte médiateur avec des données rattachées
* Quand le titulaire supprime son compte
* Et un administrateur rejoue l'effacement de ce compte
* Alors l'identité anonyme du compte est inchangée
* Et la liaison au fournisseur d'identité est supprimée
