import json
from pathlib import Path

import pandas as pd


def json_to_excel(
    json_file: str,
    excel_file: str,
    record_path: list[str] | None = None,
) -> None:
    """
    Convert a JSON file to an Excel workbook.

    Parameters
    ----------
    json_file:
        Path to the input JSON file.
    excel_file:
        Path to the output Excel .xlsx file.
    record_path:
        Optional path to the list of records in nested JSON.
        Example: ["results", "items"].
    """
    input_path = Path(json_file)
    output_path = Path(excel_file)

    if not input_path.exists():
        raise FileNotFoundError(f"JSON file not found: {input_path}")

    if output_path.suffix.lower() != ".xlsx":
        output_path = output_path.with_suffix(".xlsx")

    with input_path.open("r", encoding="utf-8") as file:
        data = json.load(file)

    if record_path:
        records = data
        for key in record_path:
            records = records[key]

        dataframe = pd.json_normalize(records)

    elif isinstance(data, list):
        dataframe = pd.json_normalize(data)

    elif isinstance(data, dict):
        # Handle a dictionary containing lists of records
        list_values = {
            key: value
            for key, value in data.items()
            if isinstance(value, list)
        }

        if len(list_values) == 1:
            dataframe = pd.json_normalize(next(iter(list_values.values())))
        else:
            dataframe = pd.json_normalize(data)

    else:
        raise ValueError("The JSON must contain a dictionary or list.")

    dataframe.to_excel(
        output_path,
        index=False,
        engine="openpyxl",
    )

    print(f"Excel file created: {output_path}")


# Example
json_to_excel(
    json_file="Json.json",
    excel_file="output.xlsx",
)
