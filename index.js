const express = require('express');
const bodyParser = require("body-parser");
const userRepository = require('./userRepository');
const Converter = require('./Converter');
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
    const foundUser = users.find(user => user.username === username);

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
})

app.post('/transactions', function(request, response){
    const user = login(request, response);
    if(!user){
        response.status(401);
        response.end(`You don't have access to this page`);
        return;
    }

    const account = request.body.account;
    const amount = request.body.amount;
    const currency = request.body.currency;
    const destination = request.body.destination;
    const details = request.body.details;
    const type = request.body.type;

    const destinationAccount = user.findAccount(destination);
    if(!destinationAccount){
        response.status(404);
        response.end(`Destination account not found`);
        return;
    }

    if(type === 'transaction'){
        const sourceAccount = user.findAccount(account);
        
        if(!sourceAccount){
            response.status(404);
            response.end(`Sender account not found`);
            return;
        }

        const sourceAmount = Converter.convert(amount, sourceAccount.currency, currency);
        const destinationAmount = Converter.convert(amount, currency, destinationAccount.currency);

        sourceAccount.subtract(sourceAmount);
        destinationAccount.add(destinationAmount);
    }
    if(type === 'cash'){
        const destinationAmount = Converter.convert(amount, currency, destinationAccount.currency);
        destinationAccount.add(destinationAmount);
    }

    response.end(`SUCCESS`);
})

app.listen(port, () => console.log(`Example app listening on port ${port}!`));
