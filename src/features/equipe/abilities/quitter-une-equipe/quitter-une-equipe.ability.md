# Feature: Quitter une équipe

## Rule: Un médiateur quitte l'équipe dont il est membre, et son passage reste archivé

### Scenario: Un membre quitte son équipe

* Given un médiateur membre d'une équipe
* When ce médiateur quitte l'équipe
* Then le départ réussit
* And son adhésion est archivée

### Scenario: Un ancien membre revenu quitte de nouveau l'équipe

> Seule l'adhésion en cours est archivée : une ancienne adhésion garde la date
> de son propre départ.

* Given un médiateur revenu dans une équipe qu'il avait déjà quittée
* When ce médiateur quitte l'équipe
* Then le départ réussit
* And il n'a plus aucune adhésion active à cette équipe
* And son ancienne adhésion garde sa date de départ

### Scenario: Un médiateur qui n'est pas membre ne peut pas quitter l'équipe

* Given un médiateur qui a déjà quitté une équipe
* When ce médiateur quitte l'équipe
* Then le départ est refusé
