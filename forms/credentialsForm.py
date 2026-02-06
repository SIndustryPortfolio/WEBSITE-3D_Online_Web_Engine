#class="form-control" id="usernameInput1"

# MODULES
# EXT
from flask_wtf import FlaskForm
from wtforms import Form, StringField, PasswordField, SubmitField, EmailField
from wtforms.validators import DataRequired

class CredentialsForm(FlaskForm):
    # CORE
    username = StringField("username", render_kw = {"class": "Input", "id": "usernameInput1"}, validators=[DataRequired()])
    email = EmailField("email", render_kw={"class": "Input", "id": "emailInput1"}, validators=[DataRequired()])
    password = PasswordField("password", render_kw = {"class": "Input", "id": "passwordInput1"}, validators=[DataRequired()])

    # Functions
    def __init__(self, formdata=..., **kwargs):
        super().__init__(formdata, **kwargs)