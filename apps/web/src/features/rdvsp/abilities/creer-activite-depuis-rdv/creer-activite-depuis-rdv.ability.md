# Feature: Créer une activité à partir d'un rendez-vous

## Rule: Seuls les participants rencontrés deviennent des bénéficiaires

### Scenario: Rendez-vous honoré avec un participant

* Given un rendez-vous à convertir avec un participant "seen"
* When je prépare un CRA depuis ce rendez-vous
* Then le CRA est prêt à être rédigé
* And 1 bénéficiaire a été créé depuis les participants

### Scenario: Participant dont la présence n'a pas encore été saisie

* Given un rendez-vous à convertir avec un participant "unknown"
* When je prépare un CRA depuis ce rendez-vous
* Then 1 bénéficiaire a été créé depuis les participants

### Scenario: Participant absent

* Given un rendez-vous à convertir avec un participant "noshow"
* When je prépare un CRA depuis ce rendez-vous
* Then aucun bénéficiaire n’a été créé depuis les participants

### Scenario: Rendez-vous déclaré non honoré, présence jamais saisie

La Coop n'écrit que le statut du rendez-vous : la participation reste "unknown"
alors même que le médiateur a déclaré l'absence.

* Given un rendez-vous à convertir "noshow" avec un participant "unknown"
* When je prépare un CRA depuis ce rendez-vous
* Then aucun bénéficiaire n’a été créé depuis les participants

### Scenario: Participant présent d'un rendez-vous annulé

* Given un rendez-vous à convertir "revoked" avec un participant "seen"
* When je prépare un CRA depuis ce rendez-vous
* Then 1 bénéficiaire a été créé depuis les participants

### Scenario: Atelier partiellement honoré

* Given un rendez-vous à convertir avec un participant "seen"
* And un second participant "excused" sur ce rendez-vous
* When je prépare un CRA depuis ce rendez-vous
* Then 1 bénéficiaire a été créé depuis les participants

## Rule: On ne convertit que ses propres rendez-vous

### Scenario: Rendez-vous rattaché à un autre agent

* Given un rendez-vous à convertir appartenant à un autre médiateur
* When je prépare un CRA depuis ce rendez-vous
* Then la préparation échoue avec l’erreur "RdvNonAutorise"
* And aucun bénéficiaire n’a été créé depuis les participants

### Scenario: Rendez-vous inconnu de La Coop

* Given un compte RDV lié sans rendez-vous à convertir
* When je prépare un CRA depuis un rendez-vous inexistant
* Then la préparation échoue avec l’erreur "RdvIntrouvable"

### Scenario: Médiateur sans compte RDV

* Given aucun compte RDV pour convertir
* When je prépare un CRA depuis un rendez-vous inexistant
* Then la préparation échoue avec l’erreur "CompteNonLie"
