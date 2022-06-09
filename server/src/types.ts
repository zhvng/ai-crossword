/**
 * Valid character in crossword
 */
export type Char = 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | 'H' | 'I' | 'J' | 'K' 
| 'L' | 'M' | 'N' | 'O' | 'P' | 'Q' | 'R' | 'S' | 'T' | 'U' | 'V' | 'W' | 'X' 
| 'Y' | 'Z';

/**
 * Possible values of a *potentially* unfilled crossword square.
 * - undefined = the square will contain a letter but it not been filled yet
 * - Char = the letter in the square
 * - 'black' = black square
 */
export type UnfilledSquare = undefined | Char | '*';

/**
 * Location of a cell on the puzzle
 */
export type Location = {row: number, col: number};

/**
 * Type detailing the currently filled in letters of a word.
 * Key=position in word, Value=character. Character must be uppercase. 
 * E.g. {0:'A', 2:'B'} = A_B__
 */
export type LetterMap = Map<number, Char>;

/**
 * Information needed to locate a word on the puzzle. Contains its beginning and direction.
 */
export type WordLocation = {
    startingSquare: Location, 
    direction: 'across' | 'down'
};

/**
 * Information about a word on the puzzle.
 */
 export type WordInfo = {
    wordLength: number, 
    letterMap: LetterMap,
    squares: Array<Location>,
 };

/**
 * A clue for the puzzle. Contains the clue text and word location.
 */
export type Clue = {
    wordLocation: WordLocation,
    clueText: string,
};

/**
 * Exported puzzle in string form and array of clues.
 */
export type ExportedPuzzle = {
    puzzle: string,
    clues: Array<Clue>,
};