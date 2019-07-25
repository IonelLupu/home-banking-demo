const database = require("./database");
const transactions = database.transactions;

module.exports = class{
    static save(transaction){
        transactions.push(transaction);
    }
    static getAll(){
        return transactions;
    }

    static find(iban, startDate, endDate){
        var newTransactions = transactions
        .filter(transaction => {
            return (
                transaction.destinationAccount && 
                transaction.destinationAccount.iban === iban
            ) ||
            (
                transaction.sourceAccount && 
                transaction.sourceAccount.iban === iban
            )
        })
        if(startDate){
            newTransactions = newTransactions.filter(transaction => {
                return transaction.date >= new Date(startDate);
            });
        }
        if(endDate){
            const newDate = new Date(endDate);
            newTransactions = newTransactions.filter(transaction => {
                return transaction.date <= new Date(endDate);
            });
        }
        return newTransactions;
    }
}