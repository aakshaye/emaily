if (process.env.NODE_ENV === 'production') {
    // return prod set of keys
    module.exports = require('./prod');
} else {
    // we are in development - return dev keys
    module.exports = require('./dev');
}
