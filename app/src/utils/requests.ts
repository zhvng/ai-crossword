import { CrosswordData } from "models/types";
import { join } from 'path';

let apiUrl = 'http://localhost:3005';
if (process.env.NODE_ENV === 'production') {
    apiUrl = 'https://api.aicrossword.app';
}

export async function requestMiniCrossword() {
    const response = await fetch(apiUrl + '/generatemini', {
        method: 'POST',
    });
    const crosswordData: CrosswordData = {
        across: new Map(),
        down: new Map(),
    }
    const data = await response.json();

    for (const clue of data.clues) {
        crosswordData[clue.wordLocation.direction][clue.wordLocation.number] = {
            clue: clue.clueText.trim().split('\n')[0],
            answer: clue.answer,
            row: clue.wordLocation.startingSquare.row,
            col: clue.wordLocation.startingSquare.col,
        };
    }
    return crosswordData;
}