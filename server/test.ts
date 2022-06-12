import Crossword from "./src/Crossword";
import WordList from "./src/WordList";
import * as dotenv from 'dotenv';
import assert = require("assert");
import { Configuration, OpenAIApi } from 'openai';
import GPT from "./src/GPT";
import Utils from "./src/Utils";

dotenv.config();
assert(process.env.OPENAI_API_KEY !== undefined);

const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
  });
const openai = new OpenAIApi(configuration);

async function testCrossword(){
    const gpt = new GPT(openai, false);

    const wordList = new WordList();
    const template = generateMiniCrosswordTemplate();
    const crossword = new Crossword(5, 5, template);
    
    console.log(template.map(arr => arr.map(elem => elem ? '_' : '*').join(' ')).join('\n'));

    let filled = false;
    while (filled === false) {
        filled = crossword.fill(wordList);
    }
    const result = await crossword.export(gpt);
    console.log(result);

    for (const clue of result.clues) {
        const {startingSquare, direction} = clue.wordLocation;
        console.log(`(${startingSquare.row}, ${startingSquare.col})-${direction}: ${clue.clueText.trim().split('\n')[0]}`);
    }
}

function generateMiniCrosswordTemplate(){
    const template = [
        [true, true, true, true, true],
        [true, true, true, true, true],
        [true, true, true, true, true],
        [true, true, true, true, true],
        [true, true, true, true, true]
    ];
    const rotate = Math.floor(Math.random() * 2);
    if (rotate === 1) {
        return Utils.rotateArrayClockwise(template);
    } else {
        return template;
    }
}

testCrossword();