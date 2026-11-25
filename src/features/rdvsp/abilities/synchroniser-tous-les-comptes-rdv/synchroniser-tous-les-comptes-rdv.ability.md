# Fonctionnalité: Synchroniser tous les comptes RDV Service Public

Chaque nuit, la Coop rattrape les rendez-vous de tous les médiateurs qui ont relié
leur compte RDV Service Public. Chaque compte est synchronisé au nom de son
propre médiateur, l'un après l'autre.

## Règle: Seuls les comptes qui peuvent l'être sont synchronisés

Un compte se synchronise s'il fonctionne, ou si son jeton a seulement expiré :
le renouvellement se fait au prochain appel. Un compte déconnecté, jamais relié
ou en erreur n'est pas appelé.

### Scénario: Un compte opérationnel est synchronisé

* Étant donné un compte RDV opérationnel parmi les comptes à synchroniser
* Quand je synchronise tous les comptes RDV
* Alors ce compte a été synchronisé

### Scénario: Un compte au jeton expiré est synchronisé

* Étant donné un compte RDV au jeton expiré parmi les comptes à synchroniser
* Quand je synchronise tous les comptes RDV
* Alors ce compte a été synchronisé

### Scénario: Un compte déconnecté n'est pas synchronisé

* Étant donné un compte RDV déconnecté parmi les comptes à synchroniser
* Quand je synchronise tous les comptes RDV
* Alors ce compte n'a pas été synchronisé

### Scénario: Un compte en erreur n'est pas synchronisé

* Étant donné un compte RDV en erreur parmi les comptes à synchroniser
* Quand je synchronise tous les comptes RDV
* Alors ce compte n'a pas été synchronisé

## Règle: L'échec d'un compte n'arrête pas les autres

### Scénario: Un compte échoue, l'autre est synchronisé

* Étant donné un compte RDV opérationnel parmi les comptes à synchroniser
* Et un autre compte RDV opérationnel parmi les comptes à synchroniser
* Et la synchronisation de ce compte échoue
* Quand je synchronise tous les comptes RDV
* Alors l'autre compte a été synchronisé
* Et le bilan compte l'échec de ce compte
