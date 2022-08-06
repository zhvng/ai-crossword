# How to train

1. Get OpenAI cli
`pip install --upgrade openai`

2. Use `format_data.py` to format csv data as jsonl with prompts.

3. Export OpenAI API key in shell with
`export OPENAI_API_KEY="<OPENAI_API_KEY>"`

4. Start finetune job with CLI
`openai api fine_tunes.create -t <TRAIN_FILE_ID_OR_PATH> -m <BASE_MODEL>
`
Datasets are in the `data/` folder

To sync with `wandb`: `openai wandb sync`