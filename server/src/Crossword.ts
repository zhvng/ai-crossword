import * as assert from 'assert';
import { OpenAIApi } from 'openai';
import { Char, Clue, ExportedPuzzle, LetterMap, Location, UnfilledSquare, WordLocation } from './types';
import Utils from './Utils';
import WordList from './WordList';

/**
 * Representation of a crossword puzzle
 */
class Crossword {
    private crossword: Array<Array<UnfilledSquare>> = [];
    private readonly wordLocations: Array<WordLocation> = [];

    constructor(
        private readonly height: number, 
        private readonly width: number, 
        template: Array<Array<Boolean>>) 
    {
        assert(template.length === height, 'template has incorrect height');
        for (const row of template) {
            assert(row.length === width, 'one or more rows in template has an incorrect width');
            const puzzleRow: Array<UnfilledSquare> = [];
            for (const square of row) {
                if (square === false) {
                    puzzleRow.push('black');
                } else {
                    puzzleRow.push(undefined);
                }
            }
            this.crossword.push(puzzleRow);
        }

        // Index starting squares
        for (const [i, row] of this.crossword.entries()) {
            for (const [j, square] of row.entries()) {
                if (square !== 'black') {
                    if (i === 0 || this.crossword[i-1][j] === 'black') {
                        const wordLocation: WordLocation = {
                            startingSquare: {row: i, col: j}, 
                            direction: 'down'
                        };
                        const [nLetters, _a, _b] = this.getInfo(wordLocation);
                        if (nLetters > 1) this.wordLocations.push(wordLocation);
                    }
                    if (j === 0 || this.crossword[i][j-1] === 'black') {
                        const wordLocation: WordLocation = {
                            startingSquare: {row: i, col: j}, 
                            direction: 'across'
                        };
                        const [nLetters, _a, _b] = this.getInfo(wordLocation);
                        if (nLetters > 1) this.wordLocations.push(wordLocation);
                    }
                }
            }
        }
    }

    /**
     * Get the length and currently filled in letters of a word on the puzzle.
     * 
     * @param wordLocation Location of the start of the word and its direction.
     * @returns Number of letters in the word, a map of currently filled in letters and positions, and a list of all squares in the word.
     */
    private getInfo(wordLocation: Readonly<WordLocation>): [number, LetterMap, Array<Location>] {
        let counter = 0;
        const {startingSquare, direction} = wordLocation;
        let row = startingSquare.row;
        let col = startingSquare.col;
        const letters: Array<[number, Char]> = [];
        const squares: Array<Location> = [];
        if (direction === 'across') {
            while (col < this.width) {
                const square = this.crossword[row][col];
                if (square === 'black') break;
                else if (square !== undefined) letters.push([counter, square]);
                squares.push({row, col});
                counter += 1;
                col += 1;
            }
        } else if (direction === 'down') {
            while (row < this.height && this.crossword[row][col] !== 'black') {
                const square = this.crossword[row][col];
                if (square === 'black') break;
                else if (square !== undefined) letters.push([counter, square])
                squares.push({row, col});
                counter += 1;
                row += 1;
            }
        }
        const letterMap: LetterMap = new Map(letters);
        return [counter, letterMap, squares];
    }

    public fill(wordList: WordList): Boolean {
        const crosswordCopy: Array<Array<UnfilledSquare>> = this.crossword.map(arr => arr.slice());
        const retries = 1000;
        for (let i = 0; i < retries; i++) {
            let filled = true;
            for (const wordLocation of Utils.shuffle(this.wordLocations)) {
                const [wordLength, letterMap, squares] = this.getInfo(wordLocation);
                const words = wordList.getWords(wordLength, letterMap, true);
                if (words.length > 0) {
                    for (const [i, character] of [...words[0]].entries()) {
                        const {row, col} = squares[i];
                        this.crossword[row][col] = character as Char;
                    }
                } else {
                    filled = false;
                    break;
                }
            }
            if (filled) {
                console.log(this.crossword, i);
                return true;
            }
        }
        console.log('failed', this.crossword);
        // revert
        this.crossword = crosswordCopy;
        return false;
    }

    public checkFilled(): Boolean {
        for (const row of this.crossword) {
            for (const square of row) {
                if (square === undefined) return false;
            }
        }
        return true;
    }

    public async export(openai: Readonly<OpenAIApi>): Promise<ExportedPuzzle> {
        const filled = this.checkFilled();
        if (filled) {
            try {
                const requests: Array<Promise<any>> = [];
                for (const wordLocation of this.wordLocations) {
                    const [wordLength, letterMap, _squares] = this.getInfo(wordLocation);
                    const wordArray = new Array(wordLength);
                    for (const [key, value] of letterMap) {
                        wordArray[key] = value;
                    }
                    const word = wordArray.join("");
                    
                    console.log(`Making API request for ${word}`);
                    const prompt = [
                        'Write a clue for this word that could be found in a crossword puzzle. Specify if the word is plural or past tense.\n',
                        'Word: froze',
                        'Clue: past tense of what happens to water when it gets cold.\n',
                        'Word: Philadelphia',
                        'Clue: it’s always sunny here.\n',
                        `Word: ${word}`,
                        'Clue:'].join('');
                    const completion = openai.createCompletion("text-davinci-002", {prompt});
                    requests.push(completion);
                }
                const results = await Promise.all(requests);
                const clues: Array<Clue> = [];
                for (const [i, completion] of results.entries()) {
                    assert(completion.data.choices);
                    console.log(completion.data.choices);
                    const clue = completion.data.choices[0].text;
                    assert(clue);
                    const wordLocation = this.wordLocations[i];
                    clues.push({
                        wordLocation,
                        clueText: clue,
                    });
                }
                return {
                    puzzle: JSON.stringify(this.crossword), 
                    clues
                };
            } catch (error: any) {
                if (error.response) {
                    console.log(error.response.status);
                    console.log(error.response.data);
                } else {
                    console.log(error.message);
                }
                throw new Error('Network Error');
            }
        } else {
            throw new Error("Puzzle is not filled");
        }
    }
}

export default Crossword