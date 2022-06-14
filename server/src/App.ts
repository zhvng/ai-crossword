import Crossword from "./Crossword";
import WordList from "./WordList";
import { Configuration, OpenAIApi } from 'openai';
import GPT from "./GPT";
import Utils from "./Utils";
import { ExportedPuzzle } from "./types";

class App {
    private readonly gpt: GPT;
    private readonly wordList: WordList;

    constructor(apiKey: string) {
        const configuration = new Configuration({ apiKey });
        const openAi = new OpenAIApi(configuration);
        this.gpt = new GPT(openAi, true);
        this.wordList = new WordList();
    }

    public async generateMiniCrossword(): Promise<ExportedPuzzle> {
        const template = this.generateMiniCrosswordTemplate();
        const crossword = new Crossword(5, 5, template);

        const filled = crossword.fill(this.wordList);
        if (!filled) throw new Error("Failed to generate puzzle, try again");

        const result = await crossword.export(this.gpt);
        return result;
    }

    private generateMiniCrosswordTemplate(){   
        const random = Utils.weightedRandom([0.4, 0.2, 0.2, 0.05, 0.05, 0.05, 0.05]);

        let template: Array<Array<boolean>> = [];

        if (random === 0) {
            template = [
                [false, true, true, true, true],
                [false, true, true, true, true],
                [true, true, true, true, true],
                [true, true, true, true, false],
                [true, true, true, true, false],
            ];
        } else if (random === 1) {
            template = [
                [false, true, true, true, true],
                [true, true, true, true, true],
                [true, true, true, true, true],
                [true, true, true, true, true],
                [true, true, true, true, false],
            ];
        } else if (random === 2) {
            template = [
                [false, true, true, true, false],
                [true, true, true, true, true],
                [true, true, true, true, true],
                [true, true, true, true, true],
                [false, true, true, true, false],
            ];
        } else if (random === 3) {
            template = [
                [false, true, true, true, true],
                [false, true, true, true, true],
                [false, true, true, true, true],
                [true, true, true, true, true],
                [true, true, true, true, true],
            ];
        } else if (random === 4) {
            template = [
                [false, true, true, true, false],
                [false, true, true, true, false],
                [true, true, true, true, true],
                [true, true, true, true, true],
                [true, true, true, true, true],
            ];
        } else if (random === 5) {
            template = [
                [false, false, true, true, true],
                [false, true, true, true, true],
                [true, true, true, true, true],
                [true, true, true, true, true],
                [true, true, true, true, false],
            ];
        } else {
            template = [
                [true, true, true, true, true],
                [false, true, true, true, true],
                [true, true, true, true, true],
                [true, true, true, true, false],
                [true, true, true, true, true],
            ];
        }
        const rotate = Math.floor(Math.random() * 2);
        if (rotate === 1) {
            return Utils.rotateArrayClockwise(template);
        } else {
            return template;
        }
    }
}

export default App;