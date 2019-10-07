(function() {
    'user strict';

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

    let messagesLoaded = 'false';

    let players = database.ref('lobby');
    let player_1 = database.ref('players/player_1');
    let player_2 = database.ref('players/player_2');


    let rps_game = {
        playerName: '',

        opponentName: '',

        playerChoice: '',

        computerChoice: '',

        choices: ['rock', 'paper', 'scissors'],

        playerscore: 0,
        
        opponentscore: 0,

        ties: 0,

        choose: function(event) {
            let choice = $(event.target).data('choice');
            rps_game.playerChoice = choice;

            let image = $('<img>').attr('src', 'assets/images/' + choice + '.png');
            image.addClass('img-fluid');
            $('#player-choice').empty();
            $('#player-choice').append(image);
            rps_game.computerChoose();
        },

        computerChoose: function() {
            rps_game.computerChoice = rps_game.choices[Math.floor(Math.random() * rps_game.choices.length)];
            let image = $('<img>').attr('src', 'assets/images/' + rps_game.computerChoice + '.png');
            image.addClass('img-fluid');
            $('#opponent-choice').empty();
            $('#opponent-choice').append(image);
            rps_game.decideWinner();
        }, 

        decideWinner: function() {
            if (rps_game.playerChoice === rps_game.computerChoice) {
                $('#tie-score').text(++rps_game.ties);
            } else if(((rps_game.choices.indexOf(rps_game.playerChoice) + 2) % rps_game.choices.length) == rps_game.choices.indexOf(rps_game.computerChoice)) {
                $('#player-score').text(++rps_game.playerscore);
            } else {
                $('#opponent-score').text(++rps_game.opponentscore);
            }
        },

        sendMessage: function(event) {
            if (event.keyCode === 13) {
                let msg = $('#message').val();
                database.ref().push({
                    name: rps_game.playerName,
                    message: msg
                });
            }
        }
    };

    database.ref().on('child_added', function(snapshot) {
        displayMessages(snapshot);
    });

    // database.ref().orderByChild('dateAdded').limitToLast(1).on('child_added', function(snapshot) {
    //     displayMessages(snapshot);
    // });

    function displayMessages(snapshot) {
        let msg = snapshot.val().message;
        let name = $('<p>').text(snapshot.val().name).addClass('msg-name');
        let p = $('<p>').text(msg).addClass('alert alert-secondary').addClass('message');
        $('#messages').append(name);
        $('#messages').append(p);
    }

    function getName() {
        let name = $('#name').val();
        if (name === '') {
            let nameError = $('<div>').addClass('alert alert-danger').attr('role', 'alert');
            nameError.text('Please enter a name.');
            $('.modal-body .form-group').append(nameError);
        } else {
            rps_game.playerName = name;
            Cookies.set('nameEntered', 'true');
            Cookies.set('playerName', name);
            $('#name-modal').modal('hide');
        }
    }
    
    $(document).ready(function() {
        messagesLoaded = false;

        $('.img-fluid').on('click', function(event) {
            event.preventDefault();
            rps_game.choose(event);
        });

        $('#message').on('keypress', function(event) {
            rps_game.sendMessage(event);
        });

        // Show modal
        let options = {
            'backdrop' : 'static',
            'show': true,
            'focus': true
        }
        
        $('#submit-name').on('click', getName);
        
        if (Cookies.get('nameEntered') !== 'true') {
            $('#name-modal').modal(options);   
        } else {
            rps_game.playerName = Cookies.get('playerName');
        }

    });
})();