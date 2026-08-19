# Feature: Afficher les rendez-vous dans la liste des activités

## Rule: La préférence appartient au compte RDV du médiateur

### Scenario: Activer l'affichage des rendez-vous

* Given un compte RDV masquant les rendez-vous dans les activités
* When je demande à voir les rendez-vous dans mes activités
* Then le compte affiche les rendez-vous dans les activités

### Scenario: Masquer les rendez-vous

* Given un compte RDV affichant les rendez-vous dans les activités
* When je demande à masquer les rendez-vous dans mes activités
* Then le compte masque les rendez-vous dans les activités

## Rule: Sans compte connecté, il n'y a pas de préférence à porter

### Scenario: Aucun compte connecté

* Given aucun compte RDV pour régler l’affichage
* When je demande à voir les rendez-vous dans mes activités
* Then le réglage échoue avec l’erreur "CompteRdvIntrouvable"
