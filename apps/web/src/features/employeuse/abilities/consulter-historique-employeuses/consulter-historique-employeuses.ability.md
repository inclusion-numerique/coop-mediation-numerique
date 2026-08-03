# Feature: Consulter l'historique des employeuses d'un utilisateur

Lecture d'administration : qui employait ce compte, depuis quand, et le
rattachement est-il encore actif.

## Rule: L'historique retient toutes les employeuses, en cours comme passées

### Scenario: Un emploi en cours et un emploi terminé

* Given un compte rattaché à "Employeuse actuelle" par une affectation active
* And ce compte rattaché à "Employeuse passée" par une affectation terminée
* When je consulte l'historique de ses employeuses
* Then l'historique compte 2 employeuses
* And "Employeuse actuelle" y figure comme rattachement actif
* And "Employeuse passée" y figure comme rattachement terminé

### Scenario: Un compte sans aucun rattachement

* Given un compte sans aucun rattachement
* When je consulte l'historique de ses employeuses
* Then l'historique est vide

## Rule: Une employeuse n'apparaît qu'une fois, même rattachée par deux sources

### Scenario: Le dispositif et le déclaratif désignent la même employeuse

* Given un compte rattaché à "Employeuse partagée" par une affectation active
* And ce compte rattaché une seconde fois à "Employeuse partagée" par une affectation terminée
* When je consulte l'historique de ses employeuses
* Then l'historique compte 1 employeuse
* And "Employeuse partagée" y figure comme rattachement actif

## Rule: Les dates d'emploi viennent du contrat, quand il en existe un

### Scenario: Un contrat renseigne la période

* Given un compte rattaché à "Employeuse actuelle" par une affectation active
* And un contrat chez "Employeuse actuelle" du "2026-01-01" au "2026-06-30"
* When je consulte l'historique de ses employeuses
* Then la période de "Employeuse actuelle" va du "2026-01-01" au "2026-06-30"

### Scenario: Sans contrat, la période reste inconnue

* Given un compte rattaché à "Employeuse actuelle" par une affectation active
* When je consulte l'historique de ses employeuses
* Then la période de "Employeuse actuelle" est inconnue
