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

    let lobby = database.ref('lobby');
    let player_1 = database.ref('player_1');
    let player_2 = database.ref('player_2');

    playerName = '';
    opponentName = '';
    playerChoice = '';
    computerChoice = '';
    choices = ['rock', 'paper', 'scissors'];
    playerscore = 0;
    opponentscore = 0;
    ties = 0;

    function choose(event) {
        let choice = $(event.target).data('choice');
        playerChoice = choice;

        let image = $('<img>').attr('src', 'assets/images/' + choice + '.png');
        image.addClass('img-fluid mx-auto');
        $('#player-choice').empty();
        $('#player-choice').append(image);
        computerChoose();
    };

    function computerChoose() {
        computerChoice = choices[Math.floor(Math.random() * choices.length)];
        let image = $('<img>').attr('src', 'assets/images/' + computerChoice + '.png');
        image.addClass('img-fluid mx-auto');
        $('#opponent-choice').empty();
        $('#opponent-choice').append(image);
        decideWinner();
    }; 

    function decideWinner() {
        if (playerChoice === computerChoice) {
            $('#tie-score').text(++ties);
        } else if(((choices.indexOf(playerChoice) + 2) % choices.length) == choices.indexOf(computerChoice)) {
            $('#player-score').text(++playerscore);
        } else {
            $('#opponent-score').text(++opponentscore);
        }
    };

    function sendMessage(event) {
        if (event.keyCode === 13) {
            let msg = $('#message').val();
            database.ref('/chat').push({
                name: playerName,
                message: msg
            });
        }
    };

    database.ref('/chat').once('child_added', function(snapshot) {
        displayMessages(snapshot);
    });

    database.ref().orderByChild('dateAdded').limitToLast(1).on('child_added', function(snapshot) {
        displayMessages(snapshot);
    });

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
            playerName = name;
            Cookies.set('nameEntered', 'true');
            Cookies.set('playerName', name);
            $('#name-modal').modal('hide');
        }
    }
    
    $(document).ready(function() {
        messagesLoaded = false;

        $('.img-fluid').on('click', function(event) {
            event.preventDefault();
            choose(event);
        });

        $('#message').on('keypress', function(event) {
            sendMessage(event);
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
            playerName = Cookies.get('playerName');
        }

    });
})();