from flask import Flask
from flask import render_template
from flask import request
from flask import abort
from flask import redirect
from flask import url_for
from flask import session

app: Flask = Flask(__name__)

# GLOBAL
@app.context_processor
def inject_site_name():
    return {"site_name": "SampleCan"}

# ROUTE
@app.route('/')
def home() -> str:
    return render_template('pages/home.html')

@app.route('/missions')
def missions() -> str:
    return render_template('pages/missions.html')

@app.route('/mission')
def mission() -> str:
    id = request.args.get("id", type=int)
    if id is None: abort(400)
    return render_template('pages/mission.html')


# ERROR
def error_handler(error_code: int, error_name: str, error_description: str):
    error_data: list = [error_code, error_name, error_description]
    return render_template('special/error.html', error_info=error_data)

@app.errorhandler(400)
def error_400(error):
    return error_handler(400, "400 Bad Request", "Sorry! We couldn't understand that request. Please check the link or try again.")

@app.errorhandler(404)
def error_404(error):
    return error_handler(404, "404 Not Found", "Oops... The page you are looking for does not exist")

@app.errorhandler(405)
def error_401(e):
    return error_handler(405, "401 Method Not Allowed", "The method is not allowed for the requested URL.")

if __name__ == "__main__":
    app.run(debug=True, host='0.0.0.0', port=5000)