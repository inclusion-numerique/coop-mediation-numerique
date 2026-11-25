# Fonctionnalité: Prendre un rendez-vous avec un bénéficiaire

## Règle: Un bénéficiaire déjà rattaché n'est jamais recréé chez RDV Service Public

### Scénario: Première demande pour un bénéficiaire

* Étant donné un bénéficiaire suivi sans usager RDV
* Quand je planifie un rendez-vous avec ce bénéficiaire
* Alors RDV Service Public reçoit une identité à créer
* Et le bénéficiaire est rattaché à l’usager rendu

### Scénario: Demande suivante pour le même bénéficiaire

* Étant donné un bénéficiaire suivi déjà rattaché à l’usager RDV 9001
* Quand je planifie un rendez-vous avec ce bénéficiaire
* Alors RDV Service Public reçoit l’usager existant 9001
* Et le bénéficiaire reste rattaché à l’usager 9001

### Scénario: Un bénéficiaire anonyme peut tout de même être planifié

* Étant donné un bénéficiaire suivi sans identité
* Quand je planifie un rendez-vous avec ce bénéficiaire
* Alors la demande aboutit

## Règle: On ne planifie que pour ses propres bénéficiaires

### Scénario: Bénéficiaire d'un autre médiateur

* Étant donné un bénéficiaire suivi par un autre médiateur
* Quand je planifie un rendez-vous avec ce bénéficiaire
* Alors la demande échoue avec l’erreur "BeneficiaireIntrouvable"
* Et RDV Service Public n’a reçu aucune demande

### Scénario: Bénéficiaire inexistant

* Étant donné aucun bénéficiaire à planifier
* Quand je planifie un rendez-vous avec un bénéficiaire inexistant
* Alors la demande échoue avec l’erreur "BeneficiaireIntrouvable"
* Et RDV Service Public n’a reçu aucune demande

## Règle: La demande exige un compte RDV exploitable

### Scénario: Médiateur sans compte RDV lié

* Étant donné un bénéficiaire suivi sans usager RDV
* Et aucun compte RDV pour planifier
* Quand je planifie un rendez-vous avec ce bénéficiaire
* Alors la demande échoue avec l’erreur "CompteNonLie"
* Et RDV Service Public n’a reçu aucune demande

### Scénario: RDV Service Public refuse la demande

* Étant donné un bénéficiaire suivi sans usager RDV
* Et RDV Service Public refusera la demande
* Quand je planifie un rendez-vous avec ce bénéficiaire
* Alors la demande échoue avec l’erreur "ApiIndisponible"
* Et le bénéficiaire n’est rattaché à aucun usager
