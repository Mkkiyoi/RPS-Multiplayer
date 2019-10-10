(function() {
    'user strict';

    /* ---------------------- Database Functionality ---------------------- */

    // Initialize config for firebase database.
    var firebaseConfig = {
        apiKey: "AIzaSyCAFHzlrBOkQfrqbRu5WhIKk6VzsYB7zrg",
        authDomain: "rps-multiplayer-c88e3.firebaseapp.com",
        databaseURL: "https://rps-multiplayer-c88e3.firebaseio.com",
        projectId: "rps-multiplayer-c88e3",
        storageBucket: "rps-multiplayer-c88e3.appspot.com",
        messagingSenderId: "641785889397",
        appId: "1:641785889397:web:cf9031bc8c251aca206e3c"
    };
    // Initialize Firebase
    firebase.initializeApp(firebaseConfig);

    
    // Get reference point to firebase databse
    let database = firebase.database();


    /* ---------------------- User/Account Functionality ---------------------- */

    function createAccount() {
        let playerName = $('#name').val().trim();
        let email = $('#email').val().trim();
        let password = $('#password').val().trim();

        // Make sure form inputs are not empty.
        if (playerName === '') {
            let nameError = $('<div>').addClass('alert alert-danger').attr('role', 'alert');
            nameError.text('Please enter a name.');
            $('.modal-body .form-group').append(nameError);
        } else if (email === '' || !email.includes('\@')) {
            let emailError = $('<div>').addClass('alert alert-danger').attr('role', 'alert');
            emailError.text('Please enter a email.');
            $('.modal-body .form-group').append(emailError);
        } else if (password === '') {
            let passwordError = $('<div>').addClass('alert alert-danger').attr('role', 'alert');
            passwordError.text('Please enter a password.');
            $('.modal-body .form-group').append(passwordError);
        } else {

            firebase.auth().createUserWithEmailAndPassword(email, password)
                .then(function(user) {
                    user.user.updateProfile({displayName: playerName});
            });
            $('#user-modal').modal('hide');
           
        }

        $('#name').text('');
        $('#email').text('');
        $('#password').text('');


    }

    function signIn() {
        let email = $('#sign-in-email').val().trim();
        let password = $('#sign-in-password').val().trim();
        console.log(email)
        firebase.auth().signInWithEmailAndPassword(email,password).then(function() {
            firebase.auth().onAuthStateChanged(function(user) {
                if (user) {
                    $('#user-modal').modal('hide');
                } else {
                    let loginError = $('<div>').addClass('alert alert-danger').attr('role', 'alert');
                    loginError.text('Your email or password was incorrect.');
                    $('.modal-body .form-group').prepend(loginError);
                    $('#email').val('');
                    $('#password').val('');
                }
            });
        });
        
    }

    function signOut() {
        firebase.auth().signOut().then(function() {
            location.reload();
        }).catch(function(error) {
            console.log(error.message)
        });
    }

    function removeAlert() {
        $('.modal-body .form-group .alert').remove();
    }

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
    let currentOnGoingGame;
    

    function choose(event, gameRef, game) {
        let choice = $(event.target).data('choice');

        let image = $('<img>').attr('src', 'assets/images/' + choice + '.png');
        image.addClass('img-fluid mx-auto');
        $('#player-choice').empty();
        $('#player-choice').append(image);
        if (game.state === STATE.PLAYER_1_TURN) {
            gameRef.update({state: STATE.PLAYER_2_TURN});
            gameRef.creator.update({choice: choice});
        } else {
            gameRef.update({state: STATE.COMPLETED});
            gameRef.joiner.update({choice: choice});
        }
    };

    function decideWinner(gameRef, game) {
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
        database.ref('/games').push(currentGame);
    }

    function joinGame(key) {
        let user = firebase.auth().currentUser; 
        let gameRef = database.ref('/games').child(key);
        gameRef.transaction(function(game) {
            if (!game.joiner) {
                game.state = STATE.JOINED
                game.joiner = {
                    uid: user.uid,
                    name: user.displayName
                }
            } else {
                alert('Game is already full');
            }
            watchGame(key)
            return game;
        });
    }

    let openGames = database.ref('/games').orderByChild('state').equalTo(STATE.OPEN);
    
    openGames.on('child_added', function(snapshot) {
        let snapVal = snapshot.val();
        if (snapVal.creator.uid != firebase.auth().currentUser.uid) {
            let btn = $('<button>').text('Join ' + snapVal.creator.name + "'s Game").attr('id', snapshot.key).addClass('btn btn-primary').on('click', function() {
                currentOnGoingGame = joinGame(snapshot.key);
            });
            $('#lobby').append(btn);
        }
    });

    openGames.on('child_removed', function(snapshot) {
        let btn = $('#' + snapshot.key);
        if (btn) {
            btn.remove();
        }
    });

    function watchGame(key) {
        let gameRef = database.ref('/games').child(key);
        gameRef.on('value', function(snapshot) {
            let game = snapshot.val();
            switch (game.state) {
                case STATE.JOINED: joinedGame(gameRef, game); break;
                case STATE.PLAYER_1_TURN: takeTurn(gameRef, game); break;
                case STATE.PLAYER_2_TURN: takeTurn(gameRef, game); break;
                case STATE.COMPLETED: decideWinner(gameRef, game); break;
            }
        });
    }

    function joinedGame(gameRef, game) {
        gameRef.update({state: STATE.PLAYER_1_TURN};
    }

    function takeTurn(gameRef, game) {
        if (game.state === STATE.PLAYER_1_TURN) {
            if (game.creator.uid === firebase.auth().currentUser.uid) {
                $('#player-choice').text('Choose rock, paper, or scissors by clicking on the appropriate picture.');
                $('.img-fluid').on('click', function(event) {
                    event.preventDefault();
                    choose(event, gameRef, game);
                });
            } else {
                $('#opponent-choice').text('Waiting for opponent to choose...');
            }
        } else {
            if (game.joiner.uid === firebase.auth().currentUser.uid) {
                $('#player-choice').text('Choose rock, paper, or scissors by clicking on the appropriate picture.');
                $('.img-fluid').on('click', function(event) {
                    event.preventDefault();
                    choose(event, gameRef, game);
                });
            } else {
                $('#opponent-choice').text('Waiting for opponent to choose...');
            }
        }
    }


    /* ---------------------- Message Functionality ---------------------- */

    function sendMessage(event) {
        event.preventDefault();
        let msg = $('#message-box');
        console.log(playerName)
        database.ref('/chat').push({
            name: playerName,
            message: msg.val()
        });
        msg.val('');
    };

    database.ref('/chat').on('child_added', function(snapshot) {
        displayMessages(snapshot);
    });

    function displayMessages(snapshot) {
        let msg = snapshot.val().message;
        let name = $('<p>').text(snapshot.val().name).addClass('msg-name');
        let p = $('<p>').text(msg).addClass('alert alert-secondary').addClass('message');
        $('#messages').append(name);
        $('#messages').append(p);
    }

    /* ---------------------- Name Functionality ---------------------- */

    
    $(document).ready(function() {

        

        $('#message').on('click', function(event) {
            event.preventDefault();
            sendMessage(event);
        });


        $('#sign-in').on('click', signIn);
        
        $('#create-account').on('click', createAccount);
        
        $("#sign-out").on('click', signOut);

        $('#sign-in-tab').on('click', removeAlert);

        $('#create-account-tab').on('click', removeAlert);

        // Prevent modal from being closed by clicking on background
        let options = {
            'backdrop' : 'static',
            'show': true,
            'focus': true
        }

        firebase.auth().onAuthStateChanged(function(user){
            
            if (!user) {
                $('#user-modal').modal(options);
            } else {
                playerName = user.displayName;
            }
        });

        $('#create-game').on('click', createGame);
    });
})();