# Fonctionnalité: Recevoir une notification de rendez-vous

## Règle: Seules les notifications d'un compte suivi sont traitées

### Scénario: Rendez-vous inconnu de La Coop

* Étant donné un compte notifié
* Quand RDV Service Public notifie la création d’un rendez-vous
* Alors la notification est traitée
* Et le rendez-vous notifié est enregistré

### Scénario: Notification pour un compte que La Coop ne suit pas

* Étant donné aucun compte notifié
* Quand RDV Service Public notifie la création d’un rendez-vous
* Alors la notification est ignorée pour la raison "compteInconnu"

### Scénario: Notification dont la forme a changé

* Étant donné un compte notifié
* Quand RDV Service Public notifie un rendez-vous illisible
* Alors la notification est ignorée pour la raison "payloadInexploitable"

## Règle: La fenêtre de synchronisation fait autorité

### Scénario: Rendez-vous antérieur à la fenêtre

* Étant donné un compte notifié synchronisé depuis le "2026-08-01"
* Quand RDV Service Public notifie un rendez-vous du "2026-07-01"
* Alors la notification est ignorée pour la raison "horsFenetreDeSynchronisation"
* Et le rendez-vous notifié n’est pas enregistré

## Règle: Un refus de compte rendu survit aux notifications sans substance

### Scénario: Notification identique sur un rendez-vous dont le CRA a été écarté

* Étant donné un compte notifié
* Et le rendez-vous notifié est déjà enregistré avec un CRA écarté
* Quand RDV Service Public notifie ce rendez-vous sans changement
* Alors la notification est ignorée pour la raison "reglageDuCompteRenduPreserve"
* Et le rendez-vous notifié garde son CRA écarté

### Scénario: Notification porteuse d'un changement réel

* Étant donné un compte notifié
* Et le rendez-vous notifié est déjà enregistré avec un CRA écarté
* Quand RDV Service Public notifie ce rendez-vous au statut "noshow"
* Alors la notification est traitée
* Et le rendez-vous notifié porte le statut "noshow"

## Règle: Une suppression annoncée est appliquée une seule fois

### Scénario: Rendez-vous détruit chez RDV Service Public

* Étant donné un compte notifié
* Et le rendez-vous notifié est déjà enregistré
* Quand RDV Service Public notifie la suppression du rendez-vous
* Alors la notification est traitée
* Et le rendez-vous notifié n’est pas enregistré

### Scénario: Suppression notifiée deux fois

* Étant donné un compte notifié
* Quand RDV Service Public notifie la suppression du rendez-vous
* Alors la notification est ignorée pour la raison "dejaSupprime"

## Règle: Une organisation que La Coop ne connaît pas fait renoncer

### Scénario: Organisation inconnue de La Coop

* Étant donné un compte notifié sans son organisation
* Quand RDV Service Public notifie la création d’un rendez-vous
* Alors la notification est ignorée pour la raison "organisationInconnue"
* Et le rendez-vous notifié n’est pas enregistré
