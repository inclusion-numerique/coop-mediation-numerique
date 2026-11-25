# Fonctionnalité: Créer une activité à partir d'un rendez-vous

## Règle: Seuls les participants rencontrés deviennent des bénéficiaires

### Scénario: Rendez-vous honoré avec un participant

* Étant donné un rendez-vous à convertir avec un participant "seen"
* Quand je prépare un CRA depuis ce rendez-vous
* Alors le CRA est prêt à être rédigé
* Et 1 participant est confié à la création des bénéficiaires

### Scénario: Participant dont la présence n'a pas encore été saisie

* Étant donné un rendez-vous à convertir avec un participant "unknown"
* Quand je prépare un CRA depuis ce rendez-vous
* Alors 1 participant est confié à la création des bénéficiaires

### Scénario: Participant absent

* Étant donné un rendez-vous à convertir avec un participant "noshow"
* Quand je prépare un CRA depuis ce rendez-vous
* Alors aucun participant n’est confié à la création des bénéficiaires

### Scénario: Rendez-vous déclaré non honoré, présence jamais saisie

La Coop n'écrit que le statut du rendez-vous : la participation reste "unknown"
alors même que le médiateur a déclaré l'absence.

* Étant donné un rendez-vous à convertir "noshow" avec un participant "unknown"
* Quand je prépare un CRA depuis ce rendez-vous
* Alors aucun participant n’est confié à la création des bénéficiaires

### Scénario: Participant présent d'un rendez-vous annulé

* Étant donné un rendez-vous à convertir "revoked" avec un participant "seen"
* Quand je prépare un CRA depuis ce rendez-vous
* Alors 1 participant est confié à la création des bénéficiaires

### Scénario: Atelier partiellement honoré

* Étant donné un rendez-vous à convertir avec un participant "seen"
* Et un second participant "excused" sur ce rendez-vous
* Quand je prépare un CRA depuis ce rendez-vous
* Alors 1 participant est confié à la création des bénéficiaires

## Règle: On ne convertit que ses propres rendez-vous

### Scénario: Rendez-vous rattaché à un autre agent

* Étant donné un rendez-vous à convertir appartenant à un autre médiateur
* Quand je prépare un CRA depuis ce rendez-vous
* Alors la préparation échoue avec l’erreur "RdvNonAutorise"
* Et aucun participant n’est confié à la création des bénéficiaires

### Scénario: Rendez-vous inconnu de La Coop

* Étant donné un compte RDV lié sans rendez-vous à convertir
* Quand je prépare un CRA depuis un rendez-vous inexistant
* Alors la préparation échoue avec l’erreur "RdvIntrouvable"

### Scénario: Médiateur sans compte RDV

* Étant donné aucun compte RDV pour convertir
* Quand je prépare un CRA depuis un rendez-vous inexistant
* Alors la préparation échoue avec l’erreur "CompteNonLie"
