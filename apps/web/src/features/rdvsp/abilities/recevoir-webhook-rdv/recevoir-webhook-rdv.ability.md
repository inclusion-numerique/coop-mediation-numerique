# Feature: Recevoir une notification de rendez-vous

## Rule: Seules les notifications d'un compte suivi sont traitées

### Scenario: Rendez-vous inconnu de La Coop

* Given un compte notifié
* When RDV Service Public notifie la création d’un rendez-vous
* Then la notification est traitée
* And le rendez-vous notifié est enregistré

### Scenario: Notification pour un compte que La Coop ne suit pas

* Given aucun compte notifié
* When RDV Service Public notifie la création d’un rendez-vous
* Then la notification est ignorée pour la raison "compteInconnu"

### Scenario: Notification dont la forme a changé

* Given un compte notifié
* When RDV Service Public notifie un rendez-vous illisible
* Then la notification est ignorée pour la raison "payloadInexploitable"

## Rule: La fenêtre de synchronisation fait autorité

### Scenario: Rendez-vous antérieur à la fenêtre

* Given un compte notifié synchronisé depuis le "2026-08-01"
* When RDV Service Public notifie un rendez-vous du "2026-07-01"
* Then la notification est ignorée pour la raison "horsFenetreDeSynchronisation"
* And le rendez-vous notifié n’est pas enregistré

## Rule: Un refus de compte rendu survit aux notifications sans substance

### Scenario: Notification identique sur un rendez-vous dont le CRA a été écarté

* Given un compte notifié
* And le rendez-vous notifié est déjà enregistré avec un CRA écarté
* When RDV Service Public notifie ce rendez-vous sans changement
* Then la notification est ignorée pour la raison "reglageDuCompteRenduPreserve"
* And le rendez-vous notifié garde son CRA écarté

### Scenario: Notification porteuse d'un changement réel

* Given un compte notifié
* And le rendez-vous notifié est déjà enregistré avec un CRA écarté
* When RDV Service Public notifie ce rendez-vous au statut "noshow"
* Then la notification est traitée
* And le rendez-vous notifié porte le statut "noshow"

## Rule: Une suppression annoncée est appliquée une seule fois

### Scenario: Rendez-vous détruit chez RDV Service Public

* Given un compte notifié
* And le rendez-vous notifié est déjà enregistré
* When RDV Service Public notifie la suppression du rendez-vous
* Then la notification est traitée
* And le rendez-vous notifié n’est pas enregistré

### Scenario: Suppression notifiée deux fois

* Given un compte notifié
* When RDV Service Public notifie la suppression du rendez-vous
* Then la notification est ignorée pour la raison "dejaSupprime"

## Rule: Une organisation que La Coop ne connaît pas fait renoncer

### Scenario: Organisation inconnue de La Coop

* Given un compte notifié sans son organisation
* When RDV Service Public notifie la création d’un rendez-vous
* Then la notification est ignorée pour la raison "organisationInconnue"
* And le rendez-vous notifié n’est pas enregistré
