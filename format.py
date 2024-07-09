import json
import csv

# Open the JSON file
with open('/home/rozar/Desktop/holders.json') as json_file:
    data = json.load(json_file)

# Open a CSV file for writing
with open('/home/rozar/Desktop/holders.csv', 'w', newline='') as csv_file:
    writer = csv.writer(csv_file)

    # Write the header row
    writer.writerow(['col1', 'col2'])

    # Write each key-value pair as a row in the CSV file
    for key, value in data.items():
        writer.writerow([key, value])
