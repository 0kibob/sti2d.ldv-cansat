from flask import Flask
from flask import render_template
from flask import request
from flask import redirect
from flask import url_for
from flask import session

app: Flask = Flask(__name__)

@app.route('/')
def home() -> str:
    return render_template('test.html')

if not __name__ == "__main__": quit()
app.run(debug=True, host='0.0.0.0', port=5000)