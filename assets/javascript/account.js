'use strict'

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