#class="form-control" id="usernameInput1"

# MODULES
# EXT
from flask_wtf import FlaskForm
from wtforms import Form, StringField, PasswordField, SubmitField
from wtforms.validators import DataRequired

class LoginForm(FlaskForm):
    # CORE
    username = StringField("username", render_kw = {"class": "Input", "id": "usernameInput1"}, validators=[DataRequired()])
    password = PasswordField("password", render_kw = {"class": "Input", "id": "passwordInput1"}, validators=[DataRequired()])
    #submit = SubmitField("submit", render_kw = {"class" : "btn btn-success", "value": "Login", "id" : "formSubmit1"})
    