/**
 * Crossword puzzle format according to https://github.com/JaredReisinger/react-crossword.
 */
export type CrosswordData = {
    across: Map<number, {
        clue: string,
        answer: string,
        row: number,
        col: number
    }>,
    down: Map<number, {
        clue: string,
        answer: string,
        row: number,
        col: number
    }>
};

export type CrosswordState = {
    startingTimestamp: number,
    endingTimestamp: number | undefined,
    isSolved: boolean,
    usedReveal: boolean,
}

export type CrosswordType = 'mini' | 'standard';