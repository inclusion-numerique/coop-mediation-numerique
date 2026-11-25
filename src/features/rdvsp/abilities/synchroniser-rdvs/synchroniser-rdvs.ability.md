# Fonctionnalité: Synchroniser les rendez-vous d'un compte RDV

## Règle: Ce que RDV Service Public renvoie fait foi

### Scénario: Rendez-vous inconnu de La Coop

* Étant donné un compte RDV à synchroniser
* Et RDV Service Public renvoie un rendez-vous à venir
* Quand je synchronise les rendez-vous
* Alors le rendez-vous est enregistré
* Et le bilan compte 1 rendez-vous créé
* Et l’usager du rendez-vous est enregistré

### Scénario: Rendez-vous déjà à jour

* Étant donné un compte RDV à synchroniser
* Et un rendez-vous déjà enregistré au statut "unknown"
* Et RDV Service Public renvoie ce rendez-vous au statut "unknown"
* Quand je synchronise les rendez-vous
* Alors le bilan compte 1 rendez-vous inchangé
* Et le bilan compte 0 rendez-vous mis à jour

### Scénario: Statut modifié chez RDV Service Public

* Étant donné un compte RDV à synchroniser
* Et un rendez-vous déjà enregistré au statut "unknown"
* Et RDV Service Public renvoie ce rendez-vous au statut "seen"
* Quand je synchronise les rendez-vous
* Alors le rendez-vous enregistré porte le statut "seen"
* Et le bilan compte 1 rendez-vous mis à jour

### Scénario: Rendez-vous disparu de RDV Service Public

* Étant donné un compte RDV à synchroniser
* Et un rendez-vous déjà enregistré au statut "unknown"
* Et RDV Service Public ne renvoie aucun rendez-vous
* Quand je synchronise les rendez-vous
* Alors le rendez-vous n’est plus enregistré
* Et le bilan compte 1 rendez-vous supprimé

## Règle: Un échec de l'API laisse la base intacte

### Scénario: RDV Service Public injoignable

* Étant donné un compte RDV à synchroniser
* Et un rendez-vous déjà enregistré au statut "unknown"
* Et RDV Service Public refusera de lister les rendez-vous
* Quand je synchronise les rendez-vous
* Alors la synchronisation des rendez-vous échoue avec l’erreur "ApiIndisponible"
* Et le rendez-vous enregistré porte le statut "unknown"
