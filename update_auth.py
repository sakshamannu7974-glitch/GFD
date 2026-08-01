import pathlib

# Update JS bundle in lovestory/login/assets/index-DIMTV75v.js
bundle_path = pathlib.Path('d:/love/lovestory/login/assets/index-DIMTV75v.js')
bundle_text = bundle_path.read_text(encoding='utf-8')

old_handler = 'onClick:()=>{if(!o||!o.trim()){alert("Pehle password toh dalo jaan! 😉");}else{sessionStorage.setItem("authenticated","true");window.location.replace("../");}}'

new_handler = 'onClick:()=>{const eRegex=/^[^\s@]+@[^\s@]+\.[^\s@]+$/;if(!i||!eRegex.test(i.trim())){alert("Sahi email address dalo jaan! ✉️");}else if(o!==`0325`){alert("Galat password hai jaan! Sahi password dalo 😉");}else{sessionStorage.setItem("authenticated","true");window.location.replace("../");}}'

if old_handler in bundle_text:
    bundle_text = bundle_text.replace(old_handler, new_handler)
    print("Bundle handler replaced successfully!")
else:
    print("WARNING: old_handler pattern not found in bundle!")

bundle_path.write_text(bundle_text, encoding='utf-8')

# Update App.jsx source file
jsx_path = pathlib.Path('d:/love/temp_login/man login/src/App.jsx')
jsx_text = jsx_path.read_text(encoding='utf-8')

old_jsx_handler = '''onClick={() => {
              if (!password || !password.trim()) {
                alert('Pehle password toh dalo jaan! 😉')
              } else {
                sessionStorage.setItem('authenticated', 'true')
                window.location.replace('../')
              }
            }}'''

new_jsx_handler = '''onClick={() => {
              const emailRegex = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/
              if (!email || !emailRegex.test(email.trim())) {
                alert('Sahi email address dalo jaan! ✉️')
              } else if (password !== '0325') {
                alert('Galat password hai jaan! Sahi password dalo 😉')
              } else {
                sessionStorage.setItem('authenticated', 'true')
                window.location.replace('../')
              }
            }}'''

if old_jsx_handler in jsx_text:
    jsx_text = jsx_text.replace(old_jsx_handler, new_jsx_handler)
    print("App.jsx handler replaced successfully!")
else:
    print("WARNING: old_jsx_handler pattern not found in App.jsx!")

jsx_path.write_text(jsx_text, encoding='utf-8')
print("Finished update_auth.py!")
