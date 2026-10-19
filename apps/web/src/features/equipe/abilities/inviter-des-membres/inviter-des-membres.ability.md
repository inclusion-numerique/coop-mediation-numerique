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
