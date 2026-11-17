# Feature: Inviter des membres

## Rule: Le coordinateur invite des personnes par leur email

### Scenario: Le coordinateur invite une personne sans compte

* Given un coordinateur qui constitue son équipe
* When le coordinateur invite "nouvelle-personne@example.com"
* Then 1 invitation est envoyée
* And "nouvelle-personne@example.com" attend une réponse

### Scenario: Le médiateur invité est reconnu d'après son email

* Given un coordinateur qui constitue son équipe
* And un médiateur inscrit sur la Coop
* When le coordinateur invite ce médiateur en écrivant son email en majuscules
* Then 1 invitation est envoyée
* And l'invitation désigne ce médiateur

## Rule: On n'invite pas deux fois la même personne

### Scenario: Une personne qui n'a pas encore répondu n'est pas invitée de nouveau

* Given un coordinateur qui a déjà invité "deja-invitee@example.com"
* When le coordinateur invite "deja-invitee@example.com"
* Then aucune invitation n'est envoyée

### Scenario: Un membre de l'équipe n'est pas invité

* Given un coordinateur qui constitue son équipe
* And un médiateur déjà membre de cette équipe
* When le coordinateur invite ce médiateur en écrivant son email en majuscules
* Then aucune invitation n'est envoyée

### Scenario: L'invitation d'un autre coordinateur n'empêche pas d'inviter

* Given un coordinateur qui constitue son équipe
* And un autre coordinateur qui a invité "partagee@example.com"
* When le coordinateur invite "partagee@example.com"
* Then 1 invitation est envoyée

## Rule: Une personne qui a refusé peut être invitée de nouveau

### Scenario: L'invitation refusée repart en attente

* Given un coordinateur dont "a-refuse@example.com" a refusé l'invitation
* When le coordinateur invite "a-refuse@example.com"
* Then 1 invitation est envoyée
* And "a-refuse@example.com" attend une réponse

## Rule: Le coordinateur trouve les médiateurs à inviter par leur nom, prénom ou email

### Scenario: Un médiateur est trouvé par son nom

* Given un coordinateur qui constitue son équipe
* And un médiateur inscrit sur la Coop
* When le coordinateur recherche ce médiateur par son nom
* Then ce médiateur est proposé

### Scenario: La recherche ignore la casse

* Given un coordinateur qui constitue son équipe
* And un médiateur inscrit sur la Coop
* When le coordinateur recherche ce médiateur par son nom en majuscules
* Then ce médiateur est proposé

### Scenario: Un médiateur est trouvé par son email

* Given un coordinateur qui constitue son équipe
* And un médiateur inscrit sur la Coop
* When le coordinateur recherche ce médiateur par son email
* Then ce médiateur est proposé

### Scenario: Chaque mot de la recherche doit correspondre

* Given un coordinateur qui constitue son équipe
* And un médiateur inscrit sur la Coop
* When le coordinateur recherche ce médiateur par son nom et un prénom qui n'est pas le sien
* Then ce médiateur n'est pas proposé

## Rule: Seuls les membres actuels de l'équipe ne sont pas proposés

> Un ancien membre peut être invité de nouveau : la recherche le propose,
> comme l'invitation par email l'accepte.

### Scenario: Un membre de l'équipe n'est pas proposé

* Given un coordinateur qui constitue son équipe
* And un médiateur déjà membre de cette équipe
* When le coordinateur recherche ce médiateur par son nom
* Then ce médiateur n'est pas proposé

### Scenario: Un ancien membre de l'équipe est proposé

* Given un coordinateur qui constitue son équipe
* And un ancien membre de cette équipe
* When le coordinateur recherche ce médiateur par son nom
* Then ce médiateur est proposé

### Scenario: Le membre de l'équipe d'un autre coordinateur est proposé

* Given un coordinateur qui constitue son équipe
* And un médiateur membre de l'équipe d'un autre coordinateur
* When le coordinateur recherche ce médiateur par son nom
* Then ce médiateur est proposé

## Rule: Un compte supprimé n'est pas proposé

### Scenario: Le médiateur d'un compte supprimé n'est pas proposé

* Given un coordinateur qui constitue son équipe
* And un médiateur dont le compte est supprimé
* When le coordinateur recherche ce médiateur par son nom
* Then ce médiateur n'est pas proposé
