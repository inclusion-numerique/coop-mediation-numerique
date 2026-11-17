# Feature: Prendre un rendez-vous avec un bénéficiaire

## Rule: Un bénéficiaire déjà rattaché n'est jamais recréé chez RDV Service Public

### Scenario: Première demande pour un bénéficiaire

* Given un bénéficiaire suivi sans usager RDV
* When je planifie un rendez-vous avec ce bénéficiaire
* Then RDV Service Public reçoit une identité à créer
* And le bénéficiaire est rattaché à l’usager rendu

### Scenario: Demande suivante pour le même bénéficiaire

* Given un bénéficiaire suivi déjà rattaché à l’usager RDV 9001
* When je planifie un rendez-vous avec ce bénéficiaire
* Then RDV Service Public reçoit l’usager existant 9001
* And le bénéficiaire reste rattaché à l’usager 9001

### Scenario: Un bénéficiaire anonyme peut tout de même être planifié

* Given un bénéficiaire suivi sans identité
* When je planifie un rendez-vous avec ce bénéficiaire
* Then la demande aboutit

## Rule: On ne planifie que pour ses propres bénéficiaires

### Scenario: Bénéficiaire d'un autre médiateur

* Given un bénéficiaire suivi par un autre médiateur
* When je planifie un rendez-vous avec ce bénéficiaire
* Then la demande échoue avec l’erreur "BeneficiaireIntrouvable"
* And RDV Service Public n’a reçu aucune demande

### Scenario: Bénéficiaire inexistant

* Given aucun bénéficiaire à planifier
* When je planifie un rendez-vous avec un bénéficiaire inexistant
* Then la demande échoue avec l’erreur "BeneficiaireIntrouvable"
* And RDV Service Public n’a reçu aucune demande

## Rule: La demande exige un compte RDV exploitable

### Scenario: Médiateur sans compte RDV lié

* Given un bénéficiaire suivi sans usager RDV
* And aucun compte RDV pour planifier
* When je planifie un rendez-vous avec ce bénéficiaire
* Then la demande échoue avec l’erreur "CompteNonLie"
* And RDV Service Public n’a reçu aucune demande

### Scenario: RDV Service Public refuse la demande

* Given un bénéficiaire suivi sans usager RDV
* And RDV Service Public refusera la demande
* When je planifie un rendez-vous avec ce bénéficiaire
* Then la demande échoue avec l’erreur "ApiIndisponible"
* And le bénéficiaire n’est rattaché à aucun usager
