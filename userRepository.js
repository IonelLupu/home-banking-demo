const database = require("./database");
const User = require("./User");

const users = database.users;

module.exports = class UserRepository{
    get(id){
        const user = users.find(user => user.id === id);
        return new User(user.username, user.password, user.accounts);
    }
}