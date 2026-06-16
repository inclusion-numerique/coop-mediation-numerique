# Feature: Détecter les doublons de bénéficiaires

## Rule: Deux bénéficiaires suffisamment similaires sont signalés comme doublon

### Scenario: Détecter un doublon évident

* Given un doublon évident pour ce médiateur
* When je détecte les doublons
* Then un doublon impliquant les bénéficiaires créés est détecté

### Scenario: Deux bénéficiaires distincts ne sont pas des doublons

* Given deux bénéficiaires distincts pour ce médiateur
* When je détecte les doublons
* Then aucun doublon n'implique les bénéficiaires créés
