const { connect, connection } = require('mongoose');
const config = require('../config');

connect(config.database.url, config.database.options)

connection.on('connected', () => {
    console.log('(*): Connected to the database');
})


