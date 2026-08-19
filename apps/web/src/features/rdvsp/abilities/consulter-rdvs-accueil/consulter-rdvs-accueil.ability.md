# Feature: Consulter ses rendez-vous depuis l'accueil

## Rule: L'accueil compte les rendez-vous à venir et les rendez-vous en attente

### Scenario: Rendez-vous à venir

* Given un compte RDV consultable
* And un rendez-vous "unknown" dans 3 jours
* When je consulte l’accueil
* Then l’accueil annonce 1 rendez-vous à venir
* And l’accueil annonce 0 rendez-vous passé

### Scenario: Rendez-vous échu sans présence saisie

* Given un compte RDV consultable
* And un rendez-vous "unknown" il y a 3 jours
* When je consulte l’accueil
* Then l’accueil annonce 1 rendez-vous passé
* And l’accueil annonce 0 rendez-vous à venir

### Scenario: Rendez-vous honoré en attente de compte rendu

* Given un compte RDV consultable
* And un rendez-vous "seen" il y a 3 jours
* When je consulte l’accueil
* Then l’accueil annonce 1 rendez-vous passé

### Scenario: Rendez-vous honoré dont le compte rendu a été écarté

* Given un compte RDV consultable
* And un rendez-vous "seen" il y a 3 jours dont le CRA a été écarté
* When je consulte l’accueil
* Then l’accueil annonce 0 rendez-vous passé

### Scenario: Rendez-vous annulé

* Given un compte RDV consultable
* And un rendez-vous "revoked" il y a 3 jours
* When je consulte l’accueil
* Then l’accueil annonce 0 rendez-vous passé
* And l’accueil annonce 0 rendez-vous à venir

### Scenario: Le prochain rendez-vous mis en avant est le plus proche

* Given un compte RDV consultable
* And un rendez-vous "unknown" dans 10 jours
* And un rendez-vous "unknown" dans 2 jours
* When je consulte l’accueil
* Then le prochain rendez-vous mis en avant commence dans 2 jours

## Rule: L'accueil n'affiche des données que pour un compte exploitable

### Scenario: Compte en erreur

* Given un compte RDV en erreur à consulter
* When je consulte l’accueil
* Then l’accueil affiche une alerte

### Scenario: Compte délié

* Given un compte RDV délié à consulter
* When je consulte l’accueil
* Then l’accueil masque le bloc rendez-vous

### Scenario: Médiateur sans compte RDV

* Given aucun compte RDV à consulter
* When je consulte l’accueil
* Then l’accueil masque le bloc rendez-vous
