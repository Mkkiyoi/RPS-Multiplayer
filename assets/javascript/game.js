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


    /* ---------------------- Message Functionality ---------------------- */

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

    /* ---------------------- Name Functionality ---------------------- */

    
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

        $('#sign-in').on('click', signIn);
        
        $('#create-account').on('click', createAccount);
        
        $('#user-modal').modal(options);   

        $("#sign-out").on('click', signOut);

        $('#sign-in-tab').on('click', removeAlert);
        $('#create-account-tab').on('click', removeAlert);
    });
})();