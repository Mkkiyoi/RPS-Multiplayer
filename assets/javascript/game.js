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

    

    $(document).ready(function() {

    });
})();