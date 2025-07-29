import requests
import json
import time
import os
import pandas as pd

def main():
    relevant_crimes = [
        "THEFT", "DECEPTIVE PRACTICE", "BATTERY", "ASSAULT", "ROBBERY", "CRIMINAL SEXUAL ASSAULT", "WEAPONS VIOLATION",
        "SEX OFFENSE", "HOMICIDE", "INTIMIDATION", "ARSON", "STALKING", "KIDNAPPING", "OBSCENITY", "HUMAN TRAFFICKING"
    ]


    req_offset = 0
    response = requests.get(f"https://data.cityofchicago.org/resource/x2n5-8w5q.json?$limit=10000&$offset={req_offset}")
    if response.status_code != 200:
        print(f'Error {response.status_code}')
        return
    json_file = response.json()
    df_master = pd.DataFrame(json_file)
    while True:
        req_offset += 10000
        response = requests.get(f"https://data.cityofchicago.org/resource/x2n5-8w5q.json?$limit=10000&$offset={req_offset}")
        if response.status_code != 200:
            print(f'Error {response.status_code}')
        else:  
            json_file = response.json() 
            if not json_file:
                print("reached limit")
                break
            df_master = json_to_df(json_file,df_master)
            print(req_offset)
            time.sleep(3)
    
    
    df_master['name'] = df_master['_primary_decsription']
    print(df_master['date_of_occurrence'].dtype)
    print(df_master[['name', 'latitude', 'longitude', 'date_of_occurrence']].head(10))
    df_master = df_master[['name', 'latitude', 'longitude', 'date_of_occurrence']]
    df_master = df_master[df_master['name'].isin(relevant_crimes)]
    df_master.to_csv("chicago_crime_data.csv", index=False)
    return

def json_to_df(json_file, df_existing):
    
    # If JSON is a dictionary with a key like "items", use that
    if isinstance(json_file, dict):
        # Try to detect the main list of items
        for key in json_file:
            if isinstance(json_file[key], list):
                json_file = json_file[key]
                break

    # Ensure it's a list of records
    if not isinstance(json_file, list):
        raise ValueError("JSON data must be a list of records (objects)")

    df_new = pd.DataFrame(json_file)

    # 4. Concatenate the new data to the existing DataFrame
    df_combined = pd.concat([df_existing, df_new], ignore_index=True)
    return df_combined


if __name__ == "__main__":
    main()