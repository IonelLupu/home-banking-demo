const Account = require("./Account");

module.exports = class User {
    constructor(username, password, accounts) {
        this.username = username;
        this.password = password;
        this.accounts = accounts.map(account => {
            return new Account(account.currency, account.type, account.amount, account.iban);
        });
    }

    addAccount(account) {
        this.accounts.push(account);
    }

    findAccount(iban){
        return this.accounts.find(account => account.iban === iban);
    }

    removeAccount(account){
        const accountIndex = this.accounts.indexOf(account);

        if(accountIndex === -1){
            throw new Error('Account not found');
        }

        if(account.amount != 0){
            throw new Error('The account is not empty and cannot be deleted');
        }

        user.accounts.splice(accountIndex, 1);
    }
};