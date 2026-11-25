# Fonctionnalité: Inviter des membres

## Règle: Le coordinateur invite des personnes par leur email

### Scénario: Le coordinateur invite une personne sans compte

* Étant donné un coordinateur qui constitue son équipe
* Quand le coordinateur invite "nouvelle-personne@example.com"
* Alors 1 invitation est envoyée
* Et "nouvelle-personne@example.com" attend une réponse

### Scénario: Le médiateur invité est reconnu d'après son email

* Étant donné un coordinateur qui constitue son équipe
* Et un médiateur inscrit sur la Coop
* Quand le coordinateur invite ce médiateur en écrivant son email en majuscules
* Alors 1 invitation est envoyée
* Et l'invitation désigne ce médiateur

## Règle: On n'invite pas deux fois la même personne

### Scénario: Une personne qui n'a pas encore répondu n'est pas invitée de nouveau

* Étant donné un coordinateur qui a déjà invité "deja-invitee@example.com"
* Quand le coordinateur invite "deja-invitee@example.com"
* Alors aucune invitation n'est envoyée

### Scénario: Un membre de l'équipe n'est pas invité

* Étant donné un coordinateur qui constitue son équipe
* Et un médiateur déjà membre de cette équipe
* Quand le coordinateur invite ce médiateur en écrivant son email en majuscules
* Alors aucune invitation n'est envoyée

### Scénario: L'invitation d'un autre coordinateur n'empêche pas d'inviter

* Étant donné un coordinateur qui constitue son équipe
* Et un autre coordinateur qui a invité "partagee@example.com"
* Quand le coordinateur invite "partagee@example.com"
* Alors 1 invitation est envoyée

## Règle: Une personne qui a refusé peut être invitée de nouveau

### Scénario: L'invitation refusée repart en attente

* Étant donné un coordinateur dont "a-refuse@example.com" a refusé l'invitation
* Quand le coordinateur invite "a-refuse@example.com"
* Alors 1 invitation est envoyée
* Et "a-refuse@example.com" attend une réponse

## Règle: Le coordinateur trouve les médiateurs à inviter par leur nom, prénom ou email

### Scénario: Un médiateur est trouvé par son nom

* Étant donné un coordinateur qui constitue son équipe
* Et un médiateur inscrit sur la Coop
* Quand le coordinateur recherche ce médiateur par son nom
* Alors ce médiateur est proposé

### Scénario: La recherche ignore la casse

* Étant donné un coordinateur qui constitue son équipe
* Et un médiateur inscrit sur la Coop
* Quand le coordinateur recherche ce médiateur par son nom en majuscules
* Alors ce médiateur est proposé

### Scénario: Un médiateur est trouvé par son email

* Étant donné un coordinateur qui constitue son équipe
* Et un médiateur inscrit sur la Coop
* Quand le coordinateur recherche ce médiateur par son email
* Alors ce médiateur est proposé

### Scénario: Chaque mot de la recherche doit correspondre

* Étant donné un coordinateur qui constitue son équipe
* Et un médiateur inscrit sur la Coop
* Quand le coordinateur recherche ce médiateur par son nom et un prénom qui n'est pas le sien
* Alors ce médiateur n'est pas proposé

## Règle: Seuls les membres actuels de l'équipe ne sont pas proposés

> Un ancien membre peut être invité de nouveau : la recherche le propose,
> comme l'invitation par email l'accepte.

### Scénario: Un membre de l'équipe n'est pas proposé

* Étant donné un coordinateur qui constitue son équipe
* Et un médiateur déjà membre de cette équipe
* Quand le coordinateur recherche ce médiateur par son nom
* Alors ce médiateur n'est pas proposé

### Scénario: Un ancien membre de l'équipe est proposé

* Étant donné un coordinateur qui constitue son équipe
* Et un ancien membre de cette équipe
* Quand le coordinateur recherche ce médiateur par son nom
* Alors ce médiateur est proposé

### Scénario: Le membre de l'équipe d'un autre coordinateur est proposé

* Étant donné un coordinateur qui constitue son équipe
* Et un médiateur membre de l'équipe d'un autre coordinateur
* Quand le coordinateur recherche ce médiateur par son nom
* Alors ce médiateur est proposé

## Règle: Un compte supprimé n'est pas proposé

### Scénario: Le médiateur d'un compte supprimé n'est pas proposé

* Étant donné un coordinateur qui constitue son équipe
* Et un médiateur dont le compte est supprimé
* Quand le coordinateur recherche ce médiateur par son nom
* Alors ce médiateur n'est pas proposé
