# MODULES
# EXT
from flask_wtf import FlaskForm
from wtforms import Form, StringField, PasswordField, SubmitField, EmailField
from wtforms.validators import DataRequired

# INT
from modules.debug import Debug

class SettingsForm(FlaskForm):
    # CORE
    username = StringField("username", render_kw = {"class": "form-control", "id": "usernameInput1", "disabled": True}, validators=[DataRequired()])
    email = EmailField("email", render_kw = {"class": "form-control", "id": "emailInput1", "disabled": True}, validators = [DataRequired()])
    password = PasswordField("password", render_kw = {"class": "form-control", "id": "passwordInput1", "disabled": True }, validators=[DataRequired()])
    #submit = SubmitField("submit", render_kw = {"class" : "btn btn-success", "value": "Save", "id" : "formSubmit1"})


    def setup(self, user):
        # Functions
        # INIT
        self.email.render_kw["placeholder"] = user.email
        self.username.render_kw["placeholder"] = user.username

    def __init__(self, user):
        # Functions
        # INIT
        super(SettingsForm, self).__init__()
        success, error = Debug.pcall(self.setup, user)