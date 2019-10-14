'user strict';

/* ---------------------- Game Functionality ---------------------- */

let playerName = '';
let opponentName = '';
let choices = ['rock', 'paper', 'scissors'];
let playerscore = 0;
let opponentscore = 0;
let ties = 0;
let STATE = {
    OPEN: 1,
    JOINED: 2,
    COMPLETED: 3,
    PLAYER_1_TURN: 4,
    PLAYER_2_TURN: 5
}    

function choose(event, gameRef, game) {
    let choice = $(event.target).data('choice');
    let image = $('<img>').attr('src', 'assets/images/' + choice + '.png');
    image.addClass('img-fluid mx-auto');
    $('#player-choice').empty();
    $('#player-choice').append(image);
    if (game.state === STATE.PLAYER_1_TURN) {
        gameRef.update({state: STATE.PLAYER_2_TURN});
        gameRef.child('creator').update({choice: choice});
    } else {
        gameRef.update({state: STATE.COMPLETED});
        gameRef.child('joiner').update({choice: choice});
    }
};

function decideWinner(key, gameRef, game) {
    let creatorChoice = game.creator.choice;
    let joinerChoice = game.joiner.choice;
    if (creatorChoice === joinerChoice) {
        $('#tie-score').text(++ties);
    } else if(((choices.indexOf(creatorChoice) + 2) % choices.length) == choices.indexOf(joinerChoice)) {
        if (game.creator.uid === firebase.auth().currentUser.uid) {
            $('#player-score').text(++playerscore);
        } else {
            $('#opponent-score').text(++opponentscore);
        }
    } else {
        if (game.joiner.uid === firebase.auth().currentUser.uid) {
            $('#player-score').text(++playerscore);
        } else {
            $('#opponent-score').text(++opponentscore);
        }
    }
    $('#player-choice').empty()
    $('#opponent-choice').empty()
    gameRef.update({state: STATE.PLAYER_1_TURN});
};


function createGame() {
    let user = firebase.auth().currentUser;
    let currentGame = {
        creator: {
            uid: user.uid,
            name: user.displayName
        },
        state: STATE.OPEN
    }
    database.ref('/games/').push(currentGame);
}

function joinGame(key) {
    let user = firebase.auth().currentUser; 
    let gameRef = database.ref('/games/').child(key);
    if (!gameRef.joiner) {
        gameRef.update({
            state: STATE.PLAYER_1_TURN,
            joiner: {
                uid: user.uid,
                name: user.displayName
            }
        });
    }
}

let openGames = database.ref('/games/').orderByChild('state').equalTo(STATE.OPEN);

openGames.once('child_added', function(snapshot) {
    let snapVal = snapshot.val();
    if (snapVal.creator.uid != firebase.auth().currentUser.uid) {
        let btn = $('<button>').text('Join ' + snapVal.creator.name + "'s Game").attr('id', snapshot.key).addClass('btn btn-primary').on('click', function() {
            joinGame(snapshot.key);
        });
        $('#lobby').append(btn);
    }
});

openGames.once('child_removed', function(snapshot) {
    let btn = $('#' + snapshot.key);
    if (btn) {
        btn.remove();
    }
});

database.ref('/games/').on('child_changed', function(snapshot) {
    if (snapshot.val().joiner !== undefined) {
        watchGame(snapshot.key);
    }
});

function watchGame(key) {
    let gameRef = database.ref('/games/').child(key);
    gameRef.on('value', function(snapshot) {
        let game = snapshot.val();
        switch (game.state) {
            case STATE.JOINED: joinedGame(key, gameRef, game); break;
            case STATE.PLAYER_1_TURN: takeTurn(key, gameRef, game); break;
            case STATE.PLAYER_2_TURN: takeTurn(key, gameRef, game); break;
            case STATE.COMPLETED: decideWinner(key, gameRef, game); break;
        }
    });
}

function joinedGame(key, gameRef, game) {
    gameRef.update({state: STATE.PLAYER_1_TURN});
}

function takeTurn(key, gameRef, game) {
    if (game.state === STATE.PLAYER_1_TURN) {
        if (game.creator.uid === firebase.auth().currentUser.uid) {
            $('#opponent-choice').empty();
            $('#player-choice').text('Choose rock, paper, or scissors by clicking on the appropriate picture.');
            $('.img-fluid').on('click', function(event) {
                event.preventDefault();
                choose(event, gameRef, game);
            });
        } else {
            $('#opponent-choice').text('Waiting for joiner to choose...');
        }
    } else {
        if (game.joiner.uid === firebase.auth().currentUser.uid) {
            $('#opponent-choice').empty();
            $('#player-choice').text('Choose rock, paper, or scissors by clicking on the appropriate picture.');
            $('.img-fluid').on('click', function(event) {
                event.preventDefault();
                choose(event, gameRef, game);
            });
        } else {
            $('#opponent-choice').text('Waiting for creator to choose...');
        }
    }
}