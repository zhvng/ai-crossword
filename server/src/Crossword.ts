import assert from 'assert';
import GPT from './GPT';
import { Char, Clue, ExportedPuzzle, LetterMap, Location, UnfilledSquare, WordInfo, WordLocation } from './types';
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
        template: Array<Array<boolean>>)
    {
        assert(template.length === height, 'template has incorrect height');
        for (const row of template) {
            assert(row.length === width, 'one or more rows in template has an incorrect width');
            const puzzleRow: Array<UnfilledSquare> = [];
            for (const square of row) {
                if (square === false) {
                    puzzleRow.push('*');
                } else {
                    puzzleRow.push(undefined);
                }
            }
            this.crossword.push(puzzleRow);
        }

        // Index starting squares
        let counter = 1;
        for (const [i, row] of this.crossword.entries()) {
            for (const [j, square] of row.entries()) {
                if (square !== '*') {
                    let counted = false;
                    if (i === 0 || this.crossword[i-1][j] === '*') {
                        const wordLocation: WordLocation = {
                            startingSquare: {row: i, col: j},
                            direction: 'down',
                            number: counter,
                        };
                        const { wordLength } = this.getInfo(wordLocation);
                        if (wordLength > 1) this.wordLocations.push(wordLocation);
                        counted = true;
                    }
                    if (j === 0 || this.crossword[i][j-1] === '*') {
                        const wordLocation: WordLocation = {
                            startingSquare: {row: i, col: j},
                            direction: 'across',
                            number: counter,
                        };
                        const { wordLength } = this.getInfo(wordLocation);
                        if (wordLength > 1) this.wordLocations.push(wordLocation);
                        counted = true
                    }
                    if (counted) counter += 1;
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
    private getInfo(wordLocation: Readonly<WordLocation>): WordInfo {
        let counter = 0;
        const {startingSquare, direction} = wordLocation;
        let row = startingSquare.row;
        let col = startingSquare.col;
        const letters: Array<[number, Char]> = [];
        const squares: Array<Location> = [];
        if (direction === 'across') {
            while (col < this.width) {
                const square = this.crossword[row][col];
                if (square === '*') break;
                else if (square !== undefined) letters.push([counter, square]);
                squares.push({row, col});
                counter += 1;
                col += 1;
            }
        } else if (direction === 'down') {
            while (row < this.height && this.crossword[row][col] !== '*') {
                const square = this.crossword[row][col];
                if (square === '*') break;
                else if (square !== undefined) letters.push([counter, square])
                squares.push({row, col});
                counter += 1;
                row += 1;
            }
        }
        const letterMap: LetterMap = new Map(letters);
        return {wordLength: counter, letterMap, squares};
    }

    public fillSimple(wordList: WordList): boolean {
        const retries = 10000;
        for (let i = 0; i < retries; i++) {
            const crosswordCopy: Array<Array<UnfilledSquare>> = this.crossword.slice(0).map(arr => arr.slice(0));
            let filled = true;
            for (const wordLocation of Utils.shuffle(this.wordLocations)) {
                const { wordLength, letterMap, squares } = this.getInfo(wordLocation);
                const words = wordList.getWords(wordLength, letterMap, true);
                if (words.length > 0) {
                    for (const [j, character] of [...words[0]].entries()) {
                        const {row, col} = squares[j];
                        this.crossword[row][col] = character as Char;
                    }
                } else {
                    filled = false;
                    break;
                }
            }
            if (filled) {
                return true;
            } else {
                // revert
                this.crossword = crosswordCopy;
            }
        }
        console.log('failed', this.crossword);
        return false;
    }

    public fill(wordList: Readonly<WordList>): boolean {
        // const crosswordCopy: Array<Array<UnfilledSquare>> = this.crossword.slice(0).map(arr => arr.slice(0));
        const [filled, counter] = this.fillRecurse(wordList, this.wordLocations, new Set());
        console.log(`filled: ${filled}, in ${counter} iterations`);
        return filled;
    }

    private fillRecurse(wordList: Readonly<WordList>, wordsRemaining: Readonly<Array<WordLocation>>, usedWords: Readonly<Set<string>>): [boolean, number] {
        let counter = 0;
        if (wordsRemaining.length === 0) {
            return [true, counter];
        }

        // Identify word with the smallest number of possible words left
        // This simple algorithm will reduce the space we have to search
        // If a word has no possible words left, do not continue
        let minimumWordsLeft = 1000000;
        let targetInfo: undefined | WordInfo = undefined;
        let targetLocation: undefined | WordLocation = undefined;
        const newWordsRemaining: Array<WordLocation> = [];
        for (const wordLocation of wordsRemaining) {
            const wordInfo = this.getInfo(wordLocation);
            const { wordLength, letterMap } = wordInfo;
            const wordsLeft = wordList.getWords(wordLength, letterMap, false, usedWords).length;
            if (wordsLeft === 0) {
                return [false, counter];
            } else if (wordsLeft < minimumWordsLeft) {
                if (targetLocation !== undefined) newWordsRemaining.push(targetLocation);
                minimumWordsLeft = wordsLeft;
                targetInfo = wordInfo;
                targetLocation = wordLocation;
            } else {
                newWordsRemaining.push(wordLocation);
            }
        }
        assert(targetInfo !== undefined, "Target is undefined");
        const { wordLength, letterMap, squares } = targetInfo;
        const words = wordList.getWords(wordLength, letterMap, true, usedWords);
        if (words.length > 0) {
            for (const word of words) {
                counter += 1;
                const backup: Array<UnfilledSquare> = [];
                for (const [j, character] of [...word].entries()) {
                    const {row, col} = squares[j];
                    backup.push(this.crossword[row][col]);
                    // assert that no overwriting is happening
                    if (this.crossword[row][col] !== undefined) {
                        assert(this.crossword[row][col] === character);
                    } else {
                        this.crossword[row][col] = character as Char;
                    }
                }
                const newUsedWords = new Set(usedWords);
                newUsedWords.add(word);
                const [success, recursiveCounter] = this.fillRecurse(wordList, newWordsRemaining, newUsedWords);
                counter += recursiveCounter;
                if (success) return [true, counter];

                // restore backup
                for (const [j, original] of [...backup].entries()) {
                    const {row, col} = squares[j];
                    this.crossword[row][col] = original;
                }
                if (counter > 50000) return [false, counter];
            }
        }
        return [false, counter];
    }

    public checkFilled(): boolean {
        for (const row of this.crossword) {
            for (const square of row) {
                if (square === undefined) return false;
            }
        }
        return true;
    }

    public async export(gpt: Readonly<GPT>): Promise<ExportedPuzzle> {
        const filled = this.checkFilled();
        if (filled) {
            try {
                const requests: Array<Promise<any>> = [];
                const words: Array<string> = [];
                for (const wordLocation of this.wordLocations) {
                    const { wordLength, letterMap } = this.getInfo(wordLocation);
                    const wordArray = new Array(wordLength);
                    for (const [key, value] of letterMap) {
                        wordArray[key] = value;
                    }
                    const word = wordArray.join("");
                    const completion = gpt.generateClue(word);
                    requests.push(completion);
                    words.push(word);
                }
                const results = await Promise.all(requests);
                const clues: Array<Clue> = [];
                for (const [i, completion] of results.entries()) {
                    assert(completion.choices);
                    const clue = completion.choices[0].message.content;
                    assert(clue);
                    const wordLocation = this.wordLocations[i];
                    clues.push({
                        wordLocation,
                        clueText: clue,
                        answer: words[i],
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