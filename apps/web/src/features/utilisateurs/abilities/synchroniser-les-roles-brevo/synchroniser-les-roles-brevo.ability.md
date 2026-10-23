# Feature: Synchroniser les rôles Brevo

> L'équipe communication segmente la liste de diffusion par rôle. Chaque
> nuit, chaque inscrit vivant y reçoit les rôles qu'il tient de la coop et du
> dispositif ; un inscrit sans rôle en est retiré. La coop fait foi : ce qui
> n'est plus renseigné chez elle est effacé chez Brevo.

## Rule: Les rôles se lisent dans la coop et dans le dispositif

### Scenario Outline: Un inscrit « <situation> » porte les rôles « <roles> »

* Given un inscrit vivant "<situation>"
* When les rôles Brevo sont synchronisés
* Then son contact est importé avec les rôles "<roles>"

#### Examples:

| situation                                              | roles                                         |
| ------------------------------------------------------ | --------------------------------------------- |
| médiateur hors dispositif                              | Médiateur                                     |
| médiateur conseiller numérique                         | Médiateur, Conseiller numérique               |
| coordinateur de la coop hors dispositif                | Coordinateur                                  |
| coordinateur du dispositif sans rôle coordinateur coop | Conseiller numérique, Coordinateur            |
| médiateur et coordinateur conseiller numérique         | Médiateur, Conseiller numérique, Coordinateur |

## Rule: Un inscrit sans rôle est retiré de la liste

### Scenario: Un inscrit sans rôle est retiré

* Given un inscrit vivant "sans rôle"
* When les rôles Brevo sont synchronisés
* Then son contact est retiré de la liste

### Scenario: Un coordinateur déclaré hors dispositif n'a pas de rôle

* Given un inscrit vivant "déclaré coordinateur hors dispositif"
* When les rôles Brevo sont synchronisés
* Then son contact est retiré de la liste

## Rule: Seuls les inscrits vivants sont synchronisés

### Scenario: Un compte supprimé ou une inscription inachevée est ignoré

* Given un médiateur au compte supprimé et un médiateur à l'inscription inachevée
* When les rôles Brevo sont synchronisés
* Then aucun de leurs contacts n'est importé ni retiré

## Rule: L'identité accompagne les rôles

### Scenario: Prénom, nom et téléphone sont transmis

* Given un médiateur vivant avec un prénom, un nom et un téléphone
* When les rôles Brevo sont synchronisés
* Then son contact porte son prénom, son nom, son téléphone et son identifiant

### Scenario: Un téléphone illisible n'est pas transmis

* Given un médiateur vivant dont le téléphone enregistré est illisible
* When les rôles Brevo sont synchronisés
* Then son contact est importé sans téléphone

## Rule: Les contacts partent par lots bornés

### Scenario: Aucun lot ne dépasse la taille maximale

* Given trois médiateurs vivants
* And Brevo accepte au plus deux contacts par lot
* When les rôles Brevo sont synchronisés
* Then aucun lot importé ne dépasse deux contacts
* And chacun des trois médiateurs figure dans exactement un lot

### Scenario: Un lot refusé n'empêche pas les suivants

* Given trois médiateurs vivants
* And Brevo accepte au plus deux contacts par lot et refuse celui du premier médiateur
* When les rôles Brevo sont synchronisés
* Then le bilan signale les contacts du lot refusé
* And les lots suivants sont importés
