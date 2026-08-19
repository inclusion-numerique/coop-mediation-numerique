# Feature: Synchroniser les rendez-vous d'un compte RDV

## Rule: Ce que RDV Service Public renvoie fait foi

### Scenario: Rendez-vous inconnu de La Coop

* Given un compte RDV à synchroniser
* And RDV Service Public renvoie un rendez-vous à venir
* When je synchronise les rendez-vous
* Then le rendez-vous est enregistré
* And le bilan compte 1 rendez-vous créé
* And l’usager du rendez-vous est enregistré

### Scenario: Rendez-vous déjà à jour

* Given un compte RDV à synchroniser
* And un rendez-vous déjà enregistré au statut "unknown"
* And RDV Service Public renvoie ce rendez-vous au statut "unknown"
* When je synchronise les rendez-vous
* Then le bilan compte 1 rendez-vous inchangé
* And le bilan compte 0 rendez-vous mis à jour

### Scenario: Statut modifié chez RDV Service Public

* Given un compte RDV à synchroniser
* And un rendez-vous déjà enregistré au statut "unknown"
* And RDV Service Public renvoie ce rendez-vous au statut "seen"
* When je synchronise les rendez-vous
* Then le rendez-vous enregistré porte le statut "seen"
* And le bilan compte 1 rendez-vous mis à jour

### Scenario: Rendez-vous disparu de RDV Service Public

* Given un compte RDV à synchroniser
* And un rendez-vous déjà enregistré au statut "unknown"
* And RDV Service Public ne renvoie aucun rendez-vous
* When je synchronise les rendez-vous
* Then le rendez-vous n’est plus enregistré
* And le bilan compte 1 rendez-vous supprimé

## Rule: Un échec de l'API laisse la base intacte

### Scenario: RDV Service Public injoignable

* Given un compte RDV à synchroniser
* And un rendez-vous déjà enregistré au statut "unknown"
* And RDV Service Public refusera de lister les rendez-vous
* When je synchronise les rendez-vous
* Then la synchronisation des rendez-vous échoue avec l’erreur "ApiIndisponible"
* And le rendez-vous enregistré porte le statut "unknown"
