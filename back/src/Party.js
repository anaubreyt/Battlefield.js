const Observer = require('./Observer');
const Battlefield = require('./Battlefield');
const Shot = require('./Shot');

class Party extends Observer {
    player1 = null;
    player2 = null;

    battlefield1 = new Battlefield();
    battlefield2 = new Battlefield();

    turnPlayer = null;
    play = true;

    get nextPlayer () {
        return this.turnPlayer === this.player1 ? this.player2 : this.player1;
    }

    constructor (player1, player2) {
        super();
        
        Object.assign(this, { player1, player2 });
        this.turnPlayer = player1;

        for (const player of [player1 , player2]) {
            player.party = this;
            player.emit('statusChange', 'play');           
        }

        this.turnUpdate();
    }

    turnUpdate() {
        this.player1.emit('turnUpdate', this.player1 === this.turnPlayer);
        this.player2.emit('turnUpdate', this.player2 === this.turnPlayer);
    }

    stop() {
        if (!this.play) {
            return;
        }
        this.play = false;
        this.dispatch();

        this.player1.party = null;
        this.player2.party = null;

        this.player1 = null;
        this.player2 = null;
    }

    gaveup(player) {     
        const { player1, player2 } = this;
        
        player1.emit('statusChange', player1 === player ? 'luser' : 'winner');
        player2.emit('statusChange', player2 === player ? 'luser' : 'winner');

        this.stop();
    }   
    
    addShot(player, x, y) {
        if (this.turnPlayer !== player || !this.play) {
            return;
        }

        const { player1, player2 } = this;

        const shot = new Shot(x, y)
        const result = this.nextPlayer.battlefield.addShot(shot);
        
        if (result) {
            const player1Shots = player1.battlefield.shots.map(shot => ({
                x: shot.x,
                y: shot.y,
                variant: shot.variant
            }));

            const player2Shots = player2.battlefield.shots.map(shot => ({
                x: shot.x,
                y: shot.y,
                variant: shot.variant
            }));

            player1.emit('setShots', player1Shots, player2Shots);
            player2.emit('setShots', player2Shots, player1Shots);

            if (shot.variant === 'miss') {
                this.turnPlayer = this.nextPlayer;
                this.turnUpdate();
            }
        }  
        
        if (player1.battlefield.luser || player2.battlefield.luser) {
            this.stop();

            player1.emit(
                'statusChange', 
                player1.battlefield.luser ? 'luser' : 'winner'
            );

            player2.emit(
                'statusChange',
                player2.battlefield.luser ? 'luser' : 'winner'
            );
        }
    }
}

module.exports = Party;