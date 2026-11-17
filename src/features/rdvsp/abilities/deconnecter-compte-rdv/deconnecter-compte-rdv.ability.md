# Feature: Déconnecter un compte RDV Service Public

## Rule: Déconnecter purge les jetons et rien d'autre

### Scenario: Délier un compte lié

* Given un compte RDV lié à déconnecter
* When je déconnecte mon compte RDV Service Public
* Then le compte est marqué déconnecté
* And les jetons du compte sont purgés

### Scenario: La synchronisation reste reprenable après une déconnexion

* Given un compte RDV à déconnecter synchronisé depuis le "2026-01-15"
* When je déconnecte mon compte RDV Service Public
* Then la fenêtre de synchronisation du compte est conservée au "2026-01-15"

### Scenario: Les réglages du médiateur survivent à la déconnexion

* Given un compte RDV à déconnecter affichant les rendez-vous dans les activités
* When je déconnecte mon compte RDV Service Public
* Then le compte déconnecté affiche toujours les rendez-vous dans les activités

## Rule: Déconnecter est possible quel que soit l'état du compte

### Scenario: Délier un compte en erreur

* Given un compte RDV à déconnecter en erreur "invalid_grant"
* When je déconnecte mon compte RDV Service Public
* Then le compte est marqué déconnecté
* And le compte déconnecté ne porte plus d’erreur

### Scenario: Redélier un compte déjà délié ne réécrit pas la date

* Given un compte RDV déjà déconnecté le "2026-07-08"
* When je déconnecte mon compte RDV Service Public
* Then la date de déconnexion reste le "2026-07-08"

## Rule: Un médiateur sans compte n'a rien à délier

### Scenario: Déconnexion sans compte lié

* Given aucun compte RDV pour ce médiateur
* When je déconnecte mon compte RDV Service Public
* Then la déconnexion échoue avec l’erreur "CompteRdvIntrouvable"
