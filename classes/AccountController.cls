public with sharing class AccountController {
    
    @AuraEnabled(cacheable=true)
    public static List<Account> getAccounts() {
        return [
            SELECT Id, Name, Phone, LastModifiedBy.Name, Level__c, Type,
                   (SELECT Id, StageName FROM Opportunities)
            FROM Account
            WHERE Level__c IN ('Level 1','Level 2')
            ORDER BY LastModifiedDate DESC
        ];
    }

    @AuraEnabled
    public static List<String> updateAccounts(List<Id> accountIds) {
        List<Account> accountsToUpdate = [
            SELECT Id, Name, Level__c, Type,
                   (SELECT Id, StageName FROM Opportunities)
            FROM Account
            WHERE Id IN :accountIds
        ];

        List<Account> validAccounts = new List<Account>();
        List<String> messages = new List<String>();

        for (Account acc : accountsToUpdate) {
            Boolean canUpdate = true;

            // Regla 1: No cambiar si tiene oportunidades Closed Won

            for (Opportunity opp : acc.Opportunities) {
                if (opp.StageName == 'Closed Won') {
                    messages.add(  acc.Name + ' no se puede actualizar: tiene oportunidad cerrada.');
                    canUpdate = false;
                    break;
                }
            }

            // Regla 2: No bajar de Level 2 a Level 1 si Type = "Customer - Direct"
            if (canUpdate && acc.Level__c == 'Level 2' && acc.Type == 'Customer - Direct') {
                messages.add(  acc.Name + ' no se puede bajar a Level 1: es Customer - Direct.');
                canUpdate = false;
            }

            if (canUpdate) {
                acc.Level__c = (acc.Level__c == 'Level 1') ? 'Level 2' : 'Level 1';
                validAccounts.add(acc);
            }
        }

        if (!validAccounts.isEmpty()) {
            Database.SaveResult[] results = Database.update(validAccounts, false);

            for (Integer i = 0; i < results.size(); i++) {
                if (results[i].isSuccess()) {
                    messages.add( validAccounts[i].Name + ' actualizado correctamente.');
                } else {
                    messages.add(' Error al actualizar ' + validAccounts[i].Name + ': ' + results[i].getErrors()[0].getMessage());
                }
            }
        }

        return messages;
    }
}

