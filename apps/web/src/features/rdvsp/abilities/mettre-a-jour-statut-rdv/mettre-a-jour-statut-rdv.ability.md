# Feature: Mettre à jour le statut d'un rendez-vous

## Rule: RDV Service Public fait autorité sur le statut

### Scenario: Renseigner un rendez-vous honoré

* Given un rendez-vous à statuer sur mon compte RDV
* When je déclare ce rendez-vous "seen"
* Then le rendez-vous porte le statut "seen"

### Scenario: Le statut enregistré est celui que RDV Service Public confirme

* Given un rendez-vous à statuer sur mon compte RDV
* And RDV Service Public confirmera le statut "revoked"
* When je déclare ce rendez-vous "noshow"
* Then le rendez-vous porte le statut "revoked"

### Scenario: Un refus de RDV Service Public laisse la base intacte

* Given un rendez-vous à statuer sur mon compte RDV
* And RDV Service Public refusera la mise à jour
* When je déclare ce rendez-vous "seen"
* Then la mise à jour échoue avec l’erreur "ApiIndisponible"
* And le rendez-vous porte toujours le statut "unknown"

## Rule: Déclarer un rendez-vous honoré depuis ce parcours écarte le CRA

### Scenario: Honoré sans CRA

* Given un rendez-vous à statuer sur mon compte RDV
* When je déclare ce rendez-vous "seen"
* Then le rendez-vous est marqué sans CRA à renseigner

### Scenario: Un rendez-vous annulé n'écarte aucun CRA

* Given un rendez-vous à statuer sur mon compte RDV
* When je déclare ce rendez-vous "revoked"
* Then le rendez-vous attend toujours un CRA

## Rule: On ne statue que sur ses propres rendez-vous

### Scenario: Rendez-vous rattaché à un autre agent

* Given un rendez-vous à statuer sur le compte RDV d’un autre médiateur
* When je déclare ce rendez-vous "seen"
* Then la mise à jour échoue avec l’erreur "RdvNonAutorise"
* And RDV Service Public n’a pas été sollicité

### Scenario: Rendez-vous inconnu de La Coop

* Given un compte RDV lié sans rendez-vous
* When je déclare un rendez-vous inexistant "seen"
* Then la mise à jour échoue avec l’erreur "RdvIntrouvable"
* And RDV Service Public n’a pas été sollicité

### Scenario: Médiateur sans compte RDV

* Given aucun compte RDV pour statuer
* When je déclare un rendez-vous inexistant "seen"
* Then la mise à jour échoue avec l’erreur "CompteNonLie"
* And RDV Service Public n’a pas été sollicité
