import { start } from './start.js';

let currentRoomID = -1;
let playerList = [];
let host = false;
let playerName; // need this in case they have to reconnect

// TODO: Show the user's name somewhere in the top left maybe

// TODO: Join room with no available rooms has extra space

// TODO: Text for host has been transferred

export function queue(name) {   
    playerName = name;
    connect().then(function(ws) {
        ws.send(JSON.stringify({type: 'setPlayerName', ws: ws, name: playerName}));
        document.getElementById('roombuttons').style.display = "inline";
        document.body.style.backgroundColor = "#CCCCCC";

        document.getElementById('createroombutton').onclick = function() {
            document.getElementById('roombuttons').style.display = "none";
            document.getElementById('goback').style.display = "inline";

            document.getElementById('roomname').style.display = "inline";

            document.getElementById('roomnameinput').addEventListener("keypress", function(event) {
                if (event.key === "Enter") {
                    event.preventDefault();
                    document.getElementById('submitroomnamebutton').click();
                }
            });
        }

        document.getElementById('submitroomnamebutton').onclick = function() {
            document.getElementById('openchatbutton').style.display = "inline";
            document.getElementById('openchatbutton').click();
            document.getElementById('roomname').style.display = "none";
            document.getElementById('waiting').style.display = "inline";
            document.getElementById('playerlist').style.display = "inline";
            addNewPlayer(playerName, true);

            document.getElementById('startgame').style.display = "inline";
            host = true;
            ws.send(JSON.stringify({type: 'createRoom', roomName: document.getElementById('roomnameinput').value || `${playerName}'s Room`}));
        }

        document.getElementById('joinroombutton').onclick = function() {
            document.getElementById('roombuttons').style.display = "none";
            document.getElementById('goback').style.display = "inline";
            document.getElementById('loader').style.display = "inline";
            document.body.style.backgroundColor = '#645a5a';
            ws.send(JSON.stringify({type: 'requestRooms'})); // displays all available rooms to join
        }

        document.getElementById('refreshroomsbutton').onclick = function() {
            for (const child of document.getElementById('availablerooms').children) {
                child.remove();
            }
            ws.send(JSON.stringify({type: 'requestRooms'}));
        }

        document.getElementById('goback').onclick = function() {
            document.getElementById('goback').style.display = "none";
            document.getElementById('roombuttons').style.display = "inline";
            document.getElementById('playerlist').style.display = "none";
            document.getElementById('waiting').style.display = "none";
            document.getElementById('availableroomstext').style.display = "none";
            document.getElementById('roomname').style.display = "none";
            document.getElementById('startgame').style.display = "none";
            while (document.getElementById('playerlist').children.length > 1) {
                document.getElementById('playerlist').children[document.getElementById('playerlist').children.length - 1].remove();
            }
            for (const child of document.getElementById('availablerooms').children) {
                child.remove();
            }
            document.getElementById('openchatbutton').style.display = "none";
            ws.send(JSON.stringify({type: 'removePlayer', roomID: currentRoomID, name: playerName})); // removes player from the room (if they are in one)
            currentRoomID = -1;
            host = false;
        }
        
        document.getElementById('sendmessage').addEventListener("keypress", function(event) {
            if (event.key === "Enter" && document.getElementById('sendmessage').value) {
                event.preventDefault();
                // this is where the message is sent
                ws.send(JSON.stringify({type: 'message', roomID: currentRoomID, message: document.getElementById('sendmessage').value, name: playerName}));
                document.getElementById('sendmessage').value = "";
            }
        });

        document.getElementById('startgamebutton').onclick = function() {
            ws.send(JSON.stringify({type: 'startGame', roomID: currentRoomID}));
        }

        // Listen for messages
        ws.addEventListener("message", (message) => {
            message = JSON.parse(message.data); // don't need try/catch because server is sending the message (guaranteed to be valid)
            if (message.type === 'niceTry') { // easter egg
                document.getElementById('nicetry').style.display = "inline";
                document.getElementById('entiregame').style.display = "none";
                setTimeout(() => {
                    document.getElementById('nicetry').style.display = "none";
                    document.getElementById('entiregame').style.display = "inline";
                }, 1000);
            } else if (message.type === "playerJoined") {
                document.getElementById('waiting').style.display = "none";
                document.getElementById('playerlist').style.display = "inline";
                addNewPlayer(message.newName, false);
                document.getElementById('startgamebutton').disabled = false;
                document.querySelector('#chathistory').innerHTML += `${message.newName} joined your room!\n`;
            } else if (message.type === "message") {
                document.querySelector('#chathistory').innerHTML += `${message.name}: ${message.message}\n`;
            } else if (message.type === 'sendRooms') {
                document.getElementById('loader').style.display = "none";
                document.body.style.backgroundColor = '#CCCCCC';
                document.getElementById('availableroomstext').style.display = "inline";
                for (const room of message.rooms) {
                    let roomButton = document.createElement('button');
                    // TODO: On button hover, show who is in that room
                    roomButton.innerHTML = room[0].name;
                    document.getElementById('availablerooms').appendChild(roomButton);
                    roomButton.onclick = function() {
                        currentRoomID = room[0].ID;
                        ws.send(JSON.stringify({type: 'joinedRoom', roomID: currentRoomID, name: playerName})); // notify other people that you joined
                        for (const child of document.getElementById('availablerooms').children) {
                            child.remove();
                        }
                        document.getElementById('openchatbutton').style.display = "inline";
                        document.getElementById('openchatbutton').click();
                        document.getElementById('availableroomstext').style.display = "none";
                        document.getElementById('playerlist').style.display = "inline";
                    }
                }
            } else if (message.type === 'ID') {
                currentRoomID = message.ID;
            } else if (message.type === 'addPlayer') {
                addNewPlayer(message.name, false);
            } else if (message.type === 'addYourself') {
                addNewPlayer(message.name, true);
            } else if (message.type === 'removePlayer') {
                document.querySelector('#chathistory').innerHTML += `${message.name} left your room!\n`;
                if (message.newHost) {
                    console.log('message.newHost: ', message.newHost);
                    document.getElementById('playerlist').children[1].remove();
                    document.getElementById('playerlist').children[1].innerHTML += ' (Host)';
                    document.querySelector('#chathistory').innerHTML += `Host has been automatically transferred to ${document.getElementById('playerlist').children[1].innerHTML}!\n`;
                } else {
                    document.getElementById('playerlist').children[message.indexToRemove + 1].remove();
                }
                document.getElementById('startgamebutton').disabled = !(document.getElementById('playerlist').children.length > 2);
            } else if (message.type === 'newHost') {
                host = true;
                document.getElementById('startgame').style.display = "inline";
                document.getElementById('startgamebutton').disabled = !(document.getElementById('playerlist').children.length > 2);
            } else if (message.type === 'startGame') {
                start();
            }
        });

    }).catch(function(err) {
        console.error(err);
    });
};

function addNewPlayer(name, bold) {
    let newPlayer = document.createElement('li');
    newPlayer.innerHTML = name + (document.getElementById('playerlist').children.length === 1 ? ' (Host)' : '');
    newPlayer.style.fontWeight = bold ? 'bold' : 'normal';
    playerList.push(newPlayer);
    document.getElementById('playerlist').appendChild(newPlayer);
}

function connect() {
    return new Promise(function(resolve, reject) {
        var ws = new WebSocket('wss://localhost:8080');
        document.getElementById('connectionfailed').style.display = "none";
        document.getElementById('loader').style.display = "inline";
        document.getElementById('waitingforserver').style.display = "inline";
        document.body.style.backgroundColor = "#645a5a";
        ws.onopen = function() {
            document.getElementById('loader').style.display = "none";
            document.getElementById('waitingforserver').style.display = "none";
            resolve(ws);
        };
        ws.onerror = function(err) {
            document.body.style.backgroundColor = "#CCCCCC";
            document.getElementById('loader').style.display = "none";
            document.getElementById('waitingforserver').style.display = "none";
            document.getElementById('connectionfailed').style.display = "inline";
            reject(err);
        };
    });
}

document.getElementById('tryconnectagain').onclick = function() {
    queue(playerName);
}

// TODO: run start() once a "start game" button is pressed

// TODO: UID only needs to be known server-side, must send websocket with every message (this is the identifying factor)