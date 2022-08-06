import csv
import json
import os

file_name = "model/data/data_small.jsonl"
raw_data_file = '/Users/allenzhang/Downloads/nytcrosswords.csv'
if not os.path.isfile(file_name):

    with open(file_name, "w+") as data:
        pass

    with open (raw_data_file, encoding = "ISO-8859-1") as csv_file:
        reader = csv.DictReader(csv_file)
        counter = 0
        for row in reader:
            if counter %3 == 0:
                if 'Word' in row and 'Clue' in row:
                    entry = {
                        'prompt': f"{row['Word']}\n\n",
                        'completion': f"{row['Clue']}\n"
                    }
                    # Open jsonl file and write to it
                    with open(file_name, "a") as data:
                        data.write(json.dumps(entry) + "\n")
            counter += 1
            if counter >= 900:
                break;
                