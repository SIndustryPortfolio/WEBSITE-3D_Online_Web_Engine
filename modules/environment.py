# Modules
# INT
from .utilities import Utilities

# EXT
import os

# CORE
testEnv = Utilities.loadJson("env.json") or {}

class Environment():
    @staticmethod
    def get(Key, Default=None):
        # Functions
        # INIT
        return testEnv.get(Key, os.environ.get(Key, Default))