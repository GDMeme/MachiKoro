export function endTurn(game, flag) { // flag true means the player rerolled
    if ((document.getElementById('rolldoubles').style.display !== "inline") && !flag) { // amusement park did not activate
        game.playerCounter++;
    } // otherwise, don't increment game.playerCounter
    if (game.playerCounter === game.numberOfPlayers) {
        game.playerCounter = 0;
    }

    document.querySelector('#playerturn').innerHTML = `Player ${game.playerCounter + 1}'s turn!`; // since playerCounter is 0 indexed
    document.getElementById('rolldicebutton').disabled = false;
    document.getElementById('endturnbutton').disabled = true;
    document.getElementById('rollnumber').style.display = "none";
    document.getElementById('roll2dicecheckbox').checked = false;
    document.getElementById('buysomething').style.display = "none";
    document.getElementById('rolldoubles').style.display = "none";
    document.getElementById('roll2dicecheckbox').style.display = "inline";
    for (let i = 0; i < game.players.length; i++) {
        document.getElementById(`stadiumtext${i + 1}`).style.display = "none";
        document.getElementById(`redincome${i + 1}`).style.display = "none";
        document.getElementById(`greenblueincome${i + 1}`).style.display = "none";
    }
    document.getElementById('tvplayertextbuttons').style.display = "none";
    document.getElementById('businesstext').style.display = "none";
    document.getElementById('incomesummary').style.display = "none";
    document.getElementById('redincomebreak').style.display = "none";
    document.getElementById('stadiumbreak').style.display = "none";
    document.getElementById('tvstationbreak').style.display = "none";
    document.getElementById('businessbreak').style.display = "none";

    // check landmarks
    document.getElementById('roll2dicecheckbox').disabled = !game.players[game.playerCounter].landmarks[0];

    // enable the save game button
    document.getElementById('savegamebutton').disabled = false;

    return game.playerCounter;
}