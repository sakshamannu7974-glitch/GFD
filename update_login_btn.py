import pathlib

file_path = pathlib.Path('d:/love/lovestory/login/assets/index-DIMTV75v.js')
text = file_path.read_text(encoding='utf-8')

text = text.replace('children:`Sign In`', 'children:`UmmmHmmm raha nahi jata kya`')
text = text.replace('children:"Sign In"', 'children:"UmmmHmmm raha nahi jata kya"')

file_path.write_text(text, encoding='utf-8')
print("Successfully replaced button text!")
