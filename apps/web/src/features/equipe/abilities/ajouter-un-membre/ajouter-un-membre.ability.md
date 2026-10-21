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

## Rule: La recherche ne propose que des médiateurs vivants, hors de l'équipe

### Scenario: Un médiateur hors de l'équipe est proposé

* Given une équipe à compléter, avec un membre, un médiateur extérieur et un médiateur supprimé
* When un administrateur cherche le médiateur extérieur
* Then ce médiateur est proposé à l'ajout

### Scenario: Un membre de l'équipe n'est pas proposé

* Given une équipe à compléter, avec un membre, un médiateur extérieur et un médiateur supprimé
* When un administrateur cherche le membre de l'équipe
* Then aucun médiateur n'est proposé à l'ajout

### Scenario: Un médiateur supprimé n'est pas proposé

* Given une équipe à compléter, avec un membre, un médiateur extérieur et un médiateur supprimé
* When un administrateur cherche le médiateur supprimé
* Then aucun médiateur n'est proposé à l'ajout
