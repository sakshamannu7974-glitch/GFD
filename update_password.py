import pathlib

# 1. Update JS bundle
bundle_path = pathlib.Path('d:/love/lovestory/login/assets/index-DIMTV75v.js')
bundle_text = bundle_path.read_text(encoding='utf-8')

bundle_text = bundle_text.replace('o!==`0325`', 'o!==`Annu@0325`')
bundle_text = bundle_text.replace('o!=="0325"', 'o!=="Annu@0325"')

bundle_path.write_text(bundle_text, encoding='utf-8')
print("Bundle password updated to Annu@0325!")

# 2. Update App.jsx source file
jsx_path = pathlib.Path('d:/love/temp_login/man login/src/App.jsx')
jsx_text = jsx_path.read_text(encoding='utf-8')

jsx_text = jsx_text.replace("password !== '0325'", "password !== 'Annu@0325'")
jsx_text = jsx_text.replace('password !== "0325"', 'password !== "Annu@0325"')

jsx_path.write_text(jsx_text, encoding='utf-8')
print("App.jsx password updated to Annu@0325!")
