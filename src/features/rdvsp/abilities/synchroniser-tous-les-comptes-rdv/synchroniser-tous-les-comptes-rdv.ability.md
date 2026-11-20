# Feature: Synchroniser tous les comptes RDV Service Public

Chaque nuit, la Coop rattrape les rendez-vous de tous les médiateurs qui ont relié
leur compte RDV Service Public. Chaque compte est synchronisé au nom de son
propre médiateur, l'un après l'autre.

## Rule: Seuls les comptes qui peuvent l'être sont synchronisés

Un compte se synchronise s'il fonctionne, ou si son jeton a seulement expiré :
le renouvellement se fait au prochain appel. Un compte déconnecté, jamais relié
ou en erreur n'est pas appelé.

### Scenario: Un compte opérationnel est synchronisé

* Given un compte RDV opérationnel parmi les comptes à synchroniser
* When je synchronise tous les comptes RDV
* Then ce compte a été synchronisé

### Scenario: Un compte au jeton expiré est synchronisé

* Given un compte RDV au jeton expiré parmi les comptes à synchroniser
* When je synchronise tous les comptes RDV
* Then ce compte a été synchronisé

### Scenario: Un compte déconnecté n'est pas synchronisé

* Given un compte RDV déconnecté parmi les comptes à synchroniser
* When je synchronise tous les comptes RDV
* Then ce compte n'a pas été synchronisé

### Scenario: Un compte en erreur n'est pas synchronisé

* Given un compte RDV en erreur parmi les comptes à synchroniser
* When je synchronise tous les comptes RDV
* Then ce compte n'a pas été synchronisé

## Rule: L'échec d'un compte n'arrête pas les autres

### Scenario: Un compte échoue, l'autre est synchronisé

* Given un compte RDV opérationnel parmi les comptes à synchroniser
* And un autre compte RDV opérationnel parmi les comptes à synchroniser
* And la synchronisation de ce compte échoue
* When je synchronise tous les comptes RDV
* Then l'autre compte a été synchronisé
* And le bilan compte l'échec de ce compte
