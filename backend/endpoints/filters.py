def get_unique_elements(list_of_lists):
    unique_elements = set()
    for sublist in list_of_lists:
        for item in sublist:
            unique_elements.add(item)
    return list(unique_elements)

