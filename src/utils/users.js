const users = []

const addUser = ({ id, username, room }) => {
    
    // Clean the data
    username = username.trim().toLowerCase()
    room = room.trim().toLowerCase()

    // Validate the data - username and room can't be empty or undefined
    if (!username || !room) {
        return {
            error: 'Username and room are required'
        }
    }

    // Check for existing user - same username can exist in two different rooms but not in the same room
    const existingUser = users.find((user) => {
        return user.room === room && user.username === username
    })
    if (existingUser) {
        return {
            error: 'Username is in use'
        }
    }

    // Store user
    const user = { id, username, room }
    users.push(user)
    return { user }
}

const removeUser = (id) => {

    // Find the index of a user with the given ID
    const indexInArray = users.findIndex((user) => user.id === id)

    // Remove the user if we found one
    if (indexInArray !== -1) {
        return users.splice(indexInArray, 1)[0]
    }
}

const getUser = (id) => {

    // Return the user object if exist. Otherwise, return undefined
    return users.find((user) => user.id === id)
}

const getUsersInRoom =  (roomName) => {

    // Return an array of all the users in a room. If the room doesn't exist, it returns an empty array.
    return users.filter((user) => user.room === roomName.trim().toLowerCase())
}

module.exports = {
    addUser,
    removeUser,
    getUser,
    getUsersInRoom
}