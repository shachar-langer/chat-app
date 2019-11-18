const socket = io()

// Elements
const $messageForm = document.querySelector('#message-form')
const $messageFormInput = $messageForm.querySelector('input')
const $messageFormButton = $messageForm.querySelector('button')
const $sendLocationButton = document.querySelector('#send-location')
const $messages = document.querySelector('#messages')

// Templates
const messageTemplate = document.querySelector('#message-template').innerHTML
const locationMessageTemplate = document.querySelector('#location-message-template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML

// Options
const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true })

const autoscroll = () => {
    // New message element
    const $newMessage = $messages.lastElementChild

    // Height of the new message (with the bottom margin)
    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

    // Visible height
    const visibleHeight = $messages.offsetHeight

    // Height of messages container
    const containerHeight = $messages.scrollHeight

    // scrollTop = How far have we scrolled from the top
    const scrollOffset = $messages.scrollTop + visibleHeight

    if (containerHeight - newMessageHeight <= scrollOffset) {
        $messages.scrollTop = $messages.scrollHeight
    }
}

socket.on('message', (message) => {
    // console.log(message)

    // Rendering a template and passing arguments to it
    const html = Mustache.render(messageTemplate, {
        username: message.username,
        message: message.text,
        createdAt: moment(message.createdAt).format('HH:mm')
    })

    // Add new messages before the div end (inside of it) at the bottom
    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
})

socket.on('locationMessage', (message) => {
    // console.log(message)

    // Rendering a template and passing arguments to it
    const html = Mustache.render(locationMessageTemplate, {
        username: message.username,
        url: message.url,
        createdAt: moment(message.createdAt).format('HH:mm')
    })

    // Add new messages before the div end (inside of it) at the bottom
    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
})

socket.on('roomData', ({ room, users }) => {
    const html = Mustache.render(sidebarTemplate, {
        room,
        users
    })
    document.querySelector('#sidebar').innerHTML = html
})

$messageForm.addEventListener('submit', (e) => {
    e.preventDefault()
    
    // disable button when a message is being sent
    $messageFormButton.setAttribute('disabled', 'disabled')

    // e.target holds the form itself. The elements is an object with the form's elements.
    const message = e.target.elements.message.value
    socket.emit('sendMessage', message, (error) => {
        
        // re-enable button after the message was processed by the server
        $messageFormButton.removeAttribute('disabled')

        // clear the message box and put the cursor on it
        $messageFormInput.value = ''
        $messageFormInput.focus()
        
        if (error) {
            return console.log(error)
        }

        // console.log('Message delivered!')
    })
})

$sendLocationButton.addEventListener('click', () => {
    if (!navigator.geolocation) {
        return alert('Geolocation is not supported by your browser.')
    }

    // disable button when the location is being sent
    $sendLocationButton.setAttribute('disabled', 'disabled')

    navigator.geolocation.getCurrentPosition((position) => {
        socket.emit('sendLocation', {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        }, () => {
            // enable button when the location was processed in the server
            $sendLocationButton.removeAttribute('disabled')
            // console.log('Location shared!')
        })
    })
})

socket.emit('join', { username, room }, (error) => {
    
    // If there was an error joining a room, the user will be redirected to the join page again
    if (error) {
        alert(error)
        location.href = '/'
    }
})