module.exports = class {
    constructor(
        user,
        date,
        sourceAccount,
        amount,
        currency,
        destinationAccount,
        details,
        type
    ) {
        this.user = user;
        this.date = date;
        this.sourceAccount = sourceAccount;
        this.amount = amount;
        this.currency = currency;
        this.destinationAccount = destinationAccount;
        this.details = details;
        this.type = type;
    }

    validate(){
        if(this.type === 'transaction'){
            if(!this.sourceAccount){
                return `Sender account not found`;
            }
            if(!this.destinationAccount){
                return `Destination account not found`;
            }
        }else if(this.type === 'cashin'){
            if(!this.destinationAccount){
                return `Destination account not found`;
            }
        }else if(this.type === 'cashout'){
            if(!this.sourceAccount){
                return `Sender account not found`;
            }
        }
    }
}