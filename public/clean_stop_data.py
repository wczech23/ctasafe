# read in files
# break up latitude + longitude in separate coulmns
# run each row through function to find correct line
# station name
import pandas as pd
import re

def extract_lat(coord_obj):
    coord_obj = str(coord_obj).split(",")[0]
    coord_obj = float(re.search(r'\d{2}.\d+',coord_obj).group())
    return float(coord_obj)

def extract_lon(coord_obj):
    coord_obj = str(coord_obj).split(",")[1]
    coord_obj = float(re.search(r'-\d{2}.\d+',coord_obj).group())
    return float(coord_obj)


def main():
    df = pd.read_csv('cta_stop_input.csv')
    # select only unique station names
    df = df.drop_duplicates(subset='STATION_DESCRIPTIVE_NAME')
    df['latitude'] = df['Location'].apply(extract_lat)
    df['longitude'] = df["Location"].apply(extract_lon)
    df = df.rename(columns={'G':'GREEN', 'BRN': 'BROWN', 'P': 'PURPLE', 'Pexp' : 'PURPLE EXPRESS', 'Pnk': 'PINK', 'O': 'ORANGE'})
    #df = df[['STATION_NAME', 'STATION_DESCRIPTIVE_NAME', 'latitude', 'longitude','RED', 'BLUE','GREEN', 'BROWN', 'PURPLE', 'PURPLE EXPRESS', 'PINK', 'ORANGE']]

    # create stop files for each line
    line_colors = ['RED', 'BLUE', 'GREEN', 'ORANGE', 'BROWN', 'PINK']

    for color in line_colors:
        df_line = df[df[color] == True]
        df_line = df_line[['STATION_NAME', 'STATION_DESCRIPTIVE_NAME', 'latitude', 'longitude']]
        df_line.to_csv(f"{color.lower()}_line_stops.csv", index=False)


    df.to_csv('cta_stops_out.csv', index=False)
    return

if __name__ == "__main__":
    main()