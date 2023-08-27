import { Game } from './Server Files/game.js';

import { buy } from './shop.js';

import { playerTurnLayout } from './playerturnlayout.js';

import { updateBalances, updateEstablishmentsLandmarks } from './Server Files/calculateIncome.js';

import { endTurn } from './endturn.js';

import * as C from './constants.js';

export function startGameLayout(numberOfPlayers) { // existingGame could also represent the player names

    document.getElementById('hovertip').style.display = "inline";
    document.querySelector('#titletext').innerHTML = "<u>Machi Koro</u>";

    document.getElementById('player12inventory').style.display = "flex";
    document.getElementById('player34inventory').style.display = "flex";

    if (numberOfPlayers === 4) {
        document.getElementById('player3inventory').style.visibility = "visible";
        document.getElementById('player4inventory').style.visibility = "visible";
    } else if (numberOfPlayers === 3) {
        document.getElementById('player3inventory').style.visibility = "visible";
    } else {
        // to remove the scroll bar
        document.querySelector('#player3inventory').innerHTML = ""; 
        document.querySelector('#player4inventory').innerHTML = "";
        
        document.getElementById('player3inventory').style.visibility = "hidden";
        document.getElementById('player4inventory').style.visibility = "hidden";
    }

    // TODO: Previous load game stuff, fix this
    // if (Array.isArray(existingGame)) { // existingGame represents the player names
    //     for (let i = 0; i < numberOfPlayers; i++) {
    //         document.querySelector(`#player${i + 1}text`).innerHTML = `<u><font size="6"> ${existingGame[i]} </font></u>`
    //     }
    // } else { // existingGame represents the saved game
    //     game = Object.assign(game, existingGame);
    //     updateBalances(game.players);
    //     updateEstablishmentsLandmarks(game);

    //     for (let i = 0; i < numberOfPlayers; i++) {
    //         document.querySelector(`#player${i + 1}text`).innerHTML = `<u><font size="6"> ${game.playerNames[i]} </font></u>`
    //     }   

    //     document.querySelector('#playerturn').innerHTML = `Player ${game.playerCounter + 1}'s turn!`; // since playerCounter is 0 indexed
    // }

    const buttonIDs = C.buildings.map(building => building.name);

    // * * On hover, show the card image
    // TODO: Fix this
    for (let i = 0; i < numberOfPlayers; i++) {
        for (let j = 0; j < 19; j++) {
            document.getElementById(`${buttonIDs[j]}${i + 1}`).onmouseout = function () {
                document.getElementById(`${buttonIDs[j]}${(j < 19 && j > 14) ? (game.players[game.playerCounter].landmarks[j - 15] ? 'unlocked' : 'locked') : ''}image`).style.display = "none";
                document.getElementById('cardexplanation').style.display = "none";
                document.getElementById('cardexplanation2').style.display = "none";
                document.getElementById('dicerollexplanation').style.display = "none";
            }
            document.getElementById(`${buttonIDs[j]}${i + 1}`).onmouseover = function () {
                document.getElementById('hovertip').style.display = "none";

                document.getElementById(`${buttonIDs[j]}${(j < 19 && j > 14) ? (game.players[game.playerCounter].landmarks[j - 15] ? 'unlocked' : 'locked') : ''}image`).style.display = "inline";
                document.getElementById('cardexplanation').style.display = "flex";
                document.getElementById('cardexplanation2').style.display = "flex";
                document.getElementById('dicerollexplanation').style.display = j > 14 ? "none" : "flex";
                document.getElementById('extraindent').style.display = j > 14 ? "flex" : "none";
                document.getElementById('imgWrap').style.margin = '0px ' + (document.getElementById('incomesummary').style.display === "inline" ? (j < 15 ? '-90px' : '-36px') : (j < 15 ? '-195px' : '-141px'));
            }
        }
    }

    for (let i = 0; i < buttonIDs.length; i++) {
        const id = buttonIDs[i];
        document.getElementById(`buy${id}button`).onclick = function() {
            
            // buy(i, game);
        }
    }









    // * * Reroll stuff
    let income; // TODO: Could put this as part of game class
    document.getElementById('rerollbutton').onclick = function () {
        document.getElementById('rerollbutton').disabled = true;
        document.getElementById('rolldoubles').style.display = "none";

        // subtract the income they got from the original roll
        for (let i = 0; i < players.length; i++) {
            game.players[i].balance -= income[i];
        }
        updateBalances(game.players);

        game.playerCounter = endTurn(game, true); // true means player rerolled
        playerTurnLayout(game, false);
    }

    // document.getElementById('rolldicebutton').onclick = function () {
    //     income = playerTurnLayout(game, true); // need to keep track of income to account for rerolling
    // }

    document.getElementById('savegamebutton').onclick = function() {
        document.getElementById('savegametext').style.display = "inline";
        document.querySelector('#temporarysavegametext').innerHTML = JSON.stringify(game);
        document.getElementById('savegamebutton').disabled = true; // disable the save button
    }
}
