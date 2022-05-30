import * as words4 from '../data/four-letter-words.json';
import * as words5 from '../data/five-letter-words.json';
import * as assert from 'assert';
import { LetterMap } from './types';
import Utils from './Utils';


/**
 * LOAD AND INDEX WORDS
 * */ 
class WordList {
    private readonly words: Map<number, Array<String>> = new Map();

    constructor() {
        this.words.set(4, words4);
        this.words.set(5, words5);
    }

    /**
     * Retreive a word from the word lists.
     * 
     * @param nLetters Number of lettters in the word
     * @param conditions Letter map specifying letters that must be in word.
     * @returns All possible nLetter words satifying the condtiions.
     */
    public getWords(nLetters: number, conditions: Readonly<LetterMap>, shuffle: Boolean = true): Array<String> {
        for (const [key, _] of conditions) {
            assert(key >= 0 && key < nLetters, "invalid key");
        }

        let result = [];
        for (const word of this.words.get(nLetters) ?? []) {
            let add = true;
            for (const [key, value] of conditions) {
                if (word[key] !== value) add = false;
            }
            if (add) result.push(word);
        }

        if (shuffle) {
            result = Utils.shuffle(result);
        }

        return result;
    }
}

export default WordList