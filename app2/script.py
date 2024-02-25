import csv

def splitCSV(file_path):
    with open(file_path, newline='', mode='r', encoding='utf-8') as infile, \
            open("../data/clean_movies.csv", 'w', newline='', encoding='utf-8') as outfile:
        reader = csv.DictReader(infile)
        fieldnames = reader.fieldnames + ['cleaned_genres'] 
        writer = csv.DictWriter(outfile, fieldnames=fieldnames)
        
        writer.writeheader()
        
        for row in reader:
            genres_str = row['genres'] 
            genres_list = genres_str.split('|')  
            row['cleaned_genres'] = genres_list 
            writer.writerow(row)

splitCSV("../data/movies.csv")