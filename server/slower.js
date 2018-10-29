function randomInteger(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min;
}

module.exports = function(min, max) {
    return function(req, res, next) {
        setTimeout(function() {
            next();
        }, randomInteger(min, max));
    }
}

