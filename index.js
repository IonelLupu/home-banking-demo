const express = require('express');
const bodyParser = require("body-parser");
const userRepository = require('./userRepository');
const transactionRepository = require('./transactionRepository');
const Converter = require('./Converter');
const Account = require('./Account');
const Transaction = require('./Transaction');
const jwt = require('jsonwebtoken');
const SECRET_KEY = 'asd jsshdlignsdogin;gozdnsgiseau4htvefnv4 ht werm';
const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

function login(request, response){
    const token = request.headers.authorization.replace('Bearer ', '');
    try {
        var tokenData = jwt.verify(token, SECRET_KEY);
    } catch (exception) {
        response.status(401);
        response.end(`You don't have access to this page`);
        return;
    }
    return userRepository.get(tokenData.id);
}

app.get('/', (request, response) => response.send('Hello World!'));
app.post('/login', (request, response) => {
    const username = request.body.username;
    const password = request.body.password;
    const foundUser = userRepository.getByUsername(username);
    
    if (foundUser === undefined) {
        response.status(404);
        response.send('User not found');
        return;
    }

    if (foundUser.password !== password) {
        response.status(400);
        response.send('Wrong password');
        return;
    }

    const token = jwt.sign({ id: foundUser.id }, SECRET_KEY);

    response.send({ token: token });
});

app.post('/account', function(request, response) {
    const user = login(request, response);
    if(!user){
        response.status(401);
        response.end(`You don't have access to this page`);
        return;
    }

    const account = new Account(request.body.currency, request.body.type);
    user.accounts.push(account);
    userRepository.save(user);
    response.end();
});

app.get('/accounts', function(request, response){
    const user = login(request, response);
    if(!user){
        response.status(401);
        response.end(`You don't have access to this page`);
        return;
    }

    response.send(user.accounts);
})

app.delete('/account/:iban', function(request, response){
    const user = login(request, response);
    if(!user){
        response.status(401);
        response.end(`You don't have access to this page`);
        return;
    }

    const iban = request.params.iban;
    const account = user.findAccount(iban);
    if(!account){
        response.status(404);
        response.end(`Account not found`);
        return;
    }

    user.removeAccount(account);
    userRepository.save(user);
    response.end();
})

app.post('/transactions', function(request, response){
    const user = login(request, response);
    if(!user){
        response.status(401);
        response.end(`You don't have access to this page`);
        return;
    }
                        
    const destinationAccount = user.findAccount(request.body.destination);
    const sourceAccount = user.findAccount(request.body.account);
        
    const transaction = new Transaction(
        user,
        new Date(),
        sourceAccount,
        request.body.amount,
        request.body.currency,
        destinationAccount,
        request.body.details,
        request.body.type
    );

    const error = transaction.validate();
    if(error){
        response.status(400);
        response.end(error);
        return;
    }

    try{
        if(transaction.type === 'transaction'){
            const sourceAmount = Converter.convert(transaction.amount,transaction.currency, sourceAccount.currency);
            const destinationAmount = Converter.convert(transaction.amount, transaction.currency, destinationAccount.currency);
    
            sourceAccount.subtract(sourceAmount);
            destinationAccount.add(destinationAmount);
        }
        else if(transaction.type === 'cashin'){
            const destinationAmount = Converter.convert(transaction.amount, transaction.currency, destinationAccount.currency);
            destinationAccount.add(destinationAmount);
        }
        else if(transaction.type === 'cashout'){
            const sourceAmount = Converter.convert(transaction.amount, sourceAccount.currency, transaction.currency);
            sourceAccount.subtract(sourceAmount);
        }
        transaction.status = 'success';
        userRepository.save(user);
    }catch(error){
        transaction.status = 'failed';
        response.end(`Transaction failed: ${error.message}`);
    }

    transactionRepository.save(transaction);
    response.end(`SUCCESS`);
});

app.get('/transactions', function(request, response){
    const iban = request.query.iban;
    const startDate = request.query.startDate;
    const endDate = request.query.endDate;

    response.send(transactionRepository.find(iban, startDate, endDate));
})
app.get('/total/:currency', function(request,response){
    const user = login(request, response);
    if(!user){
        response.status(401);
        response.end(`You don't have access to this page`);
        return;
    }

    const currency = request.params.currency;

    const total = user.accounts.reduce((total, account) => {
        return total + Converter.convert(account.amount, account.currency, currency);
    }, 0)

    response.send("The total is: " + total);

})

app.listen(port, () => console.log(`Example app listening on port ${port}!`));
