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
