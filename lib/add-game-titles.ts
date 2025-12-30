// This helper function adds a title field to each game object in the predictions bracket
// in the database based on the teams playing and the round of the game.

// Rules for titles:
// - First Round: no title
// - Quarterfinals: Switch Case: 
// If texas Tech is playing,  title is "Orange Bowl"
// If Indiana is playing, title is "Rose Bowl"
// If Georgia is playing, title is "Sugar Bowl"
// If Ohio State is playing, title is "Cotton Bowl"
// - Semifinals: Switch Case: 
// If Texas Tech, Oregon, Indiana or Alabama is playing, title is "Peach Bowl"
// else title is "Fiesta Bowl"
// - Championship: "National Championship"

import { Prediction, Game } from './models/prediction';

export  function addGameTitles(prediction: Prediction): Prediction {
    const updatedPrediction: Prediction = { ...prediction};
    updatedPrediction.bracket.quarterfinals = updatedPrediction.bracket.quarterfinals.map((game: Game) => {
        let title;
        if (game.team1 === 'Texas Tech' || game.team2 === 'Texas Tech') {
            title = 'Orange Bowl';
        } else if (game.team1 === 'Indiana' || game.team2 === 'Indiana') {
            title = 'Rose Bowl';
        } else if (game.team1 === 'Georgia' || game.team2 === 'Georgia') {
            title = 'Sugar Bowl';
        } else if (game.team1 === 'Ohio State' || game.team2 === 'Ohio State') {
            title = 'Cotton Bowl';
        }
        if (title) {
            return { ...game, title };
        }
        return game;
    });

    updatedPrediction.bracket.semifinals = updatedPrediction.bracket.semifinals.map((game: Game) => {
        let title;
        if (
            game.team1 === 'Texas Tech' || game.team2 === 'Texas Tech' ||
            game.team1 === 'Oregon' || game.team2 === 'Oregon' ||
            game.team1 === 'Indiana' || game.team2 === 'Indiana' ||
            game.team1 === 'Alabama' || game.team2 === 'Alabama'
        ) {
            title = 'Peach Bowl';
        } else {
            title = 'Fiesta Bowl';
        }
        if (title) {
            return { ...game, title };
        }
        return game;
    });

    updatedPrediction.bracket.championship = {
        ...updatedPrediction.bracket.championship,
        title: 'National Championship',
    };
    return updatedPrediction;
}