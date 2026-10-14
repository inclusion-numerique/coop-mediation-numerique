# Feature: Ajouter un membre

## Rule: Un administrateur rattache directement un médiateur à une équipe

### Scenario: Un médiateur invité est ajouté à l'équipe sans attendre sa réponse

* Given un médiateur invité dans deux équipes
* When un administrateur ajoute ce médiateur à la première équipe
* Then l'ajout du membre réussit
* And ce médiateur fait partie de la première équipe
* And son invitation dans la première équipe est retirée
* And son invitation dans la seconde équipe attend toujours sa réponse

## Rule: Un membre n'est pas ajouté deux fois

### Scenario: Un médiateur déjà membre n'est pas ajouté de nouveau

* Given un médiateur déjà membre d'une équipe
* When un administrateur ajoute ce médiateur à cette équipe
* Then l'ajout du membre est refusé
