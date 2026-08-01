import pathlib

file_path = pathlib.Path('d:/love/lovestory/login/assets/index-DIMTV75v.js')
text = file_path.read_text(encoding='utf-8')

# Text replacements requested by user
text = text.replace('Here is your form! ✨', 'Aa gai surprise dekhne kya baat hai ✨')
text = text.replace('Wait a second! Let me grab the login form for you! 👋', 'Ruko thoda! Tumhare liye surprise form la raha hu! 👋')
text = text.replace('Welcome Back', 'Aaja Aaja')
text = text.replace('>Sign In<', '>UmmmHmmm raha nahi jata kya<')

# Replace alert click handler with authentication check & redirect
old_click = 'onClick:()=>alert(`Logged in as ${i||`developer@codexr.com`}!`)'
new_click = 'onClick:()=>{if(!o||!o.trim()){alert("Pehle password toh dalo jaan! 😉");}else{sessionStorage.setItem("authenticated","true");window.location.replace("../");}}'

if old_click in text:
    text = text.replace(old_click, new_click)
    print("Found and replaced old_click!")
else:
    print("WARNING: old_click string pattern not matched exactly!")

file_path.write_text(text, encoding='utf-8')
print("Successfully updated index-DIMTV75v.js!")
