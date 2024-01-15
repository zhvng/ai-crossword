import OpenAI from 'openai';


/**
 * Wrapper for openai gpt api
 * */
class GPT {

    constructor(
        private readonly openai: OpenAI,
        private readonly prod: boolean = true,
        ) {}

    public async generateClue(word: string): Promise<any> {
        if (this.prod) {
            const systemPrompt = [
                `You are a crossword expert who is helping write clues for the New York Times crossword. Given a word, respond in one sentence or phrase what the clue would be. Be clever, but don't say anything you don't know for certain.\n`,
                'User: FROZE\n',
                'You: past tense of what happens to water when it gets cold\n',
                'User: PHILADELPHIA',
                `You: it's always sunny here.\n`
            ].join('');
            const completion = this.openai.chat.completions.create({
                messages: [
                    { role: 'system', content: systemPrompt},
                    { role: 'user', content: `${word}` }
                ],
                model: 'gpt-3.5-turbo-1106',
                top_p: 0.95,
            });
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