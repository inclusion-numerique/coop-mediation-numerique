# Fonctionnalité: Mettre à jour le statut d'un rendez-vous

## Règle: RDV Service Public fait autorité sur le statut

### Scénario: Renseigner un rendez-vous honoré

* Étant donné un rendez-vous à statuer sur mon compte RDV
* Quand je déclare ce rendez-vous "seen"
* Alors le rendez-vous porte le statut "seen"

### Scénario: Le statut enregistré est celui que RDV Service Public confirme

* Étant donné un rendez-vous à statuer sur mon compte RDV
* Et RDV Service Public confirmera le statut "revoked"
* Quand je déclare ce rendez-vous "noshow"
* Alors le rendez-vous porte le statut "revoked"

### Scénario: Un refus de RDV Service Public laisse la base intacte

* Étant donné un rendez-vous à statuer sur mon compte RDV
* Et RDV Service Public refusera la mise à jour
* Quand je déclare ce rendez-vous "seen"
* Alors la mise à jour échoue avec l’erreur "ApiIndisponible"
* Et le rendez-vous porte toujours le statut "unknown"

## Règle: Déclarer un rendez-vous honoré depuis ce parcours écarte le CRA

### Scénario: Honoré sans CRA

* Étant donné un rendez-vous à statuer sur mon compte RDV
* Quand je déclare ce rendez-vous "seen"
* Alors le rendez-vous est marqué sans CRA à renseigner

### Scénario: Un rendez-vous annulé n'écarte aucun CRA

* Étant donné un rendez-vous à statuer sur mon compte RDV
* Quand je déclare ce rendez-vous "revoked"
* Alors le rendez-vous attend toujours un CRA

## Règle: On ne statue que sur ses propres rendez-vous

### Scénario: Rendez-vous rattaché à un autre agent

* Étant donné un rendez-vous à statuer sur le compte RDV d’un autre médiateur
* Quand je déclare ce rendez-vous "seen"
* Alors la mise à jour échoue avec l’erreur "RdvNonAutorise"
* Et RDV Service Public n’a pas été sollicité

### Scénario: Rendez-vous inconnu de La Coop

* Étant donné un compte RDV lié sans rendez-vous
* Quand je déclare un rendez-vous inexistant "seen"
* Alors la mise à jour échoue avec l’erreur "RdvIntrouvable"
* Et RDV Service Public n’a pas été sollicité

### Scénario: Médiateur sans compte RDV

* Étant donné aucun compte RDV pour statuer
* Quand je déclare un rendez-vous inexistant "seen"
* Alors la mise à jour échoue avec l’erreur "CompteNonLie"
* Et RDV Service Public n’a pas été sollicité
