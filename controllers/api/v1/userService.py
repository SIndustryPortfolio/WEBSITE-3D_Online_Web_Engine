# MODULES
# EXT
from flask import Flask, jsonify, Blueprint, request

# CACHES
from controllers.api.caches.userServiceCache import UserServiceCache

# CORE
userServiceBlueprint = Blueprint("userService", __name__)

# ROUTES
@userServiceBlueprint.route("/<int:userId>", methods=["GET"])
def getUserDict(userId): # RETURN BASIC USER INFO (NO SENSITIVE INFO)
    return jsonify(UserServiceCache.get(userId))


@userServiceBlueprint.route("/update", methods=["POST"])
def updateUserDict():
    # Functions
    # INIT
    data = request.get_json()

    UserServiceCache.update(data["userId"])