const { connect, connection } = require('mongoose');
const config = require('../config');

connect(config.databse.url, config.databse.options)

connection.on('connected', () => {
    console.log('(*): Connected to the database');
})


