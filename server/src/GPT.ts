import { OpenAIApi } from 'openai';


/**
 * Wrapper for openai gpt api
 * */ 
class GPT {

    constructor(
        private readonly openai: OpenAIApi,
        private readonly prod: boolean = true,
        ) {}

    public async generateClue(word: string): Promise<any> {
        if (this.prod) {
            const prompt = [
                'Write a clue for this word that could be found in a crossword puzzle. Specify if the word is plural or past tense.\n',
                'Word: FROZE',
                'Clue: past tense of what happens to water when it gets cold.\n',
                'Word: PHILADELPHIA',
                'Clue: it’s always sunny here.\n',
                `Word: ${word}`,
                'Clue:'].join('');
            const completion = this.openai.createCompletion("text-davinci-002", {prompt});
            return completion;
        } else {
            return {
                data: {
                    choices: [{
                        text: 'Placeholder clue. Pass in prod=true in constructor for a real clue.'
                    }],
                },
            };
        }
    }
}

export default GPT