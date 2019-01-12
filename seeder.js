const bcrypt = require('bcrypt');
const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/session-test', {
    useCreateIndex: true,
    useNewUrlParser: true,
});

const schema = new mongoose.Schema({
    username: {
        type: String,
        unique: true,
    },
    password: {
        type: String,
    },
    role: {
        type: String,
        default: 'USER',
    },
});

const User = mongoose.model('User', schema);

const run = async () => {
    await User.create({
        username: 'admin',
        password: bcrypt.hashSync('secret123', 10),
        role: 'ADMIN',
    });

    process.exit(0);
};

run();
