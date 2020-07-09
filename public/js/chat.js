const socket = io();

const messagesDiv = document.querySelector('#messages')
const messageTemplate = document.querySelector('#message-template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-temp').innerHTML

const {username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true});

socket.on('message', (message) => {
    console.log(message);
    const html = Mustache.render(messageTemplate, {
        message: message.text,
        createdAt: moment(message.createdAt).format('h:mm a')
    })
    messagesDiv.insertAdjacentHTML('beforeend', html)
})

socket.on('roomData', ({room, users}) => {
    const html = Mustache.render(sidebarTemplate, {
        room,
        users
    })
    document.querySelector('#sidebar').innerHTML = html
})

document.querySelector('#message-form').addEventListener('submit', (e) => {
    e.preventDefault();
    document.querySelector('#sendMessageButton').setAttribute('disabled', 'disabled')

    const message = username + ': ' + document.querySelector('#messageInput').value;
    if (message !== '' || username + ': ') {
        socket.emit('sendMessage', message);
        document.querySelector('#messageInput').value = '';
    }
    document.querySelector('#sendMessageButton').removeAttribute('disabled')
})

socket.emit('join', {username, room}, (error) => {
    if (error) {
        alert(error)
        location.href ='/'
    }
})