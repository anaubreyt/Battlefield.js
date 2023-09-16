const Battlefield = require('./Battlefield');

module.exports = class Player {
    socket = null;
    party = null;
    battlefield = new Battlefield;
    sessionId = null;

    get ready () {
        return this.battlefield.complete && !this.party && this.socket;
    }

    constructor (socket, sessionId) {
        Object.assign(this, { socket, sessionId })
        this.socket = socket;
    }

    on (...args) {
        if (this.socket && this.socket.connected) {
            this.socket.on(...args);
        }
    }

    emit (...args) {
        if (this.socket && this.socket.connected) {
            this.socket.emit(...args);
        }
    }
}