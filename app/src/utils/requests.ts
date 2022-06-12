import { CrosswordData } from "models/types";

export async function requestMiniCrossword() {
    const response = await fetch('http://localhost:3005/generatemini', {
        method: 'POST',
    });
    const crosswordData: CrosswordData = {
        across: new Map(),
        down: new Map(),
    }
    const data = await response.json();

    for (const clue of data.clues) {
        crosswordData[clue.wordLocation.direction][clue.wordLocation.number] = {
            clue: clue.clueText,
            answer: clue.answer,
            row: clue.wordLocation.startingSquare.row,
            col: clue.wordLocation.startingSquare.col,
        };
    }
    return crosswordData;
}