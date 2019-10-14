/* ---------------------- Message Functionality ---------------------- */

function sendMessage(event) {
    event.preventDefault();
    let msg = $('#message-box');
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