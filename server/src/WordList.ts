import * as words2 from '../data/two-letter-words.json';
import * as words3 from '../data/three-letter-words.json';
import * as words4 from '../data/four-letter-words.json';
import * as words5 from '../data/five-letter-words.json';
import * as words6 from '../data/six-letter-words.json';
import * as assert from 'assert';
import { LetterMap } from './types';
import Utils from './Utils';


/**
 * LOAD AND INDEX WORDS
 * */ 
class WordList {
    private readonly words: Map<number, Array<string>> = new Map();

    constructor() {
        this.words.set(2, words2);
        this.words.set(3, words3);
        this.words.set(4, words4);
        this.words.set(5, words5);
        this.words.set(6, words6);
    }

    /**
     * Retreive a word from the word lists.
     * 
     * @param nLetters Number of lettters in the word
     * @param conditions Letter map specifying letters that must be in word.
     * @returns All possible nLetter words satifying the condtiions.
     */
    public getWords(nLetters: number, conditions: Readonly<LetterMap>, shuffle: boolean = true, ignoreList: Readonly<Set<string>> = new Set()): Array<string> {
        for (const [key, _] of conditions) {
            assert(key >= 0 && key < nLetters, "invalid key");
        }

        let result = [];
        for (const word of this.words.get(nLetters) ?? []) {
            let add = true;
            for (const [key, value] of conditions) {
                if (word[key] !== value) add = false;
            }
            if (add && !ignoreList.has(word)) result.push(word);
        }

        if (shuffle) {
            result = Utils.shuffle(result);
        }

        return result;
    }
}

export default WordList