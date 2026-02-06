#class="form-control" id="usernameInput1"

# MODULES
# EXT
from flask_wtf import FlaskForm
from wtforms import Form, StringField, PasswordField, SubmitField
from wtforms.validators import DataRequired

class MFAForm(FlaskForm):
    # CORE
    otp = StringField("otp", render_kw = {"class": "Input", "id": "otpInput1"}, validators = [DataRequired()])
    submit = SubmitField("submit", render_kw = {"class" : "Input", "value": "Verify", "id" : "otpFormSubmit1"})
    #cancel = SubmitField("cancel", render_kw = {"class": "btn btn-secondary", "value": "Cancel", "id" : "formCancel1"})
