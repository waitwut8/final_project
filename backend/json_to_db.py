from sqlmodel import Session
from database import engine

def auto_import_json(file_path: str):
    data = read_json_file(file_path)

    with Session(engine) as session:
        if isinstance(data, list) and "products" in data[0]:
            add_data_to_db(session, data[0])  # Assuming one cart per file
        elif isinstance(data, dict) and "products" in data:
            add_data_to_db(session, data)
        elif isinstance(data, list) and "body" in data[0]:
            add_posts_to_db(session, data)
        elif isinstance(data, dict) and "body" in data:
            add_posts_to_db(session, data)
        else:
            raise ValueError("The JSON file is having an identity crisis. No idea what to do with it.")

# Just call this with any json and let it vibe
auto_import_json("carts.json")  # or posts.json — it’ll figure it out like a good intern
