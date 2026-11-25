# Fonctionnalité: Afficher les rendez-vous dans la liste des activités

## Règle: La préférence appartient au compte RDV du médiateur

### Scénario: Activer l'affichage des rendez-vous

* Étant donné un compte RDV masquant les rendez-vous dans les activités
* Quand je demande à voir les rendez-vous dans mes activités
* Alors le compte affiche les rendez-vous dans les activités

### Scénario: Masquer les rendez-vous

* Étant donné un compte RDV affichant les rendez-vous dans les activités
* Quand je demande à masquer les rendez-vous dans mes activités
* Alors le compte masque les rendez-vous dans les activités

## Règle: Sans compte connecté, il n'y a pas de préférence à porter

### Scénario: Aucun compte connecté

* Étant donné aucun compte RDV pour régler l’affichage
* Quand je demande à voir les rendez-vous dans mes activités
* Alors le réglage échoue avec l’erreur "CompteRdvIntrouvable"
