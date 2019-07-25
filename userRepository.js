const database = require("./database");
const User = require("./User");

const users = database.users;

module.exports = class UserRepository{
    static save(user){
        const oldUser = users.find(item => item.id === user.id);
        const oldUserIndex = users.indexOf(oldUser);
        users.splice(oldUserIndex, 1, user);
    }

    static get(id){
        const user = users.find(user => user.id === id);
        return new User(user.id, user.username, user.password, user.accounts);
    }

    static getByUsername(username){
        return users.find(user => user.username === username);
    }
}