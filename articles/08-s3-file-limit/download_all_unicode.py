#!/usr/bin/env python3

from bs4 import BeautifulSoup
import requests
import csv

url = "https://www.fileformat.info/info/charset/UTF-8/list.htm"

if __name__ == "__main__":
    start = 0

    while True:
        r = requests.get(f"{url}?start={start}")
        soup = BeautifulSoup(r.text, 'html.parser')
        table = soup.find('table', class_="table table-bordered table-striped")

        rows = table.find_all('tr')
        if len(rows) == 0 or rows is None:
            break

        with open("unicode.csv", "a") as csvfile:
            spamwriter = csv.writer(csvfile, escapechar='\\')
            for row in rows:
                td = row.find_all('td')
                a = False
                for cell in td:
                    if "colspan" in cell.attrs and cell.attrs["colspan"] == "2":
                        a = True
                        break
                    print(cell.text, end='')
                if a:
                    continue
                spamwriter.writerow([f"{cell.text}" for cell in td][1:])
                print("")

        start += 1024
