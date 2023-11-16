from config import config_from_env, config_from_dict, ConfigurationSet
from flask import Flask, jsonify, render_template, request
from flask.logging import default_handler
from flask_cors import CORS
from image_service import ImageService
from gevent.pywsgi import WSGIServer
from flask_minify import Minify
from dotenv import load_dotenv
import logging
import os


DEFAULT_CONFIG = {
    # information about the server
    "app.host": "0.0.0.0",
    "app.port": 8080,
    "app.debug": False,

    # log level for debugging
    "log_level": "WARNING",

    # ai features for image analysis
    "ai_enabled": True
}

PREFIX = "PHOTO_ANALYZER"


def main():
    load_dotenv()

    cfg = ConfigurationSet(
        config_from_env(prefix=PREFIX, separator="-", lowercase_keys=True),
        config_from_dict(DEFAULT_CONFIG)
    )
    cfg["app.debug"] = str(cfg["app.debug"]).lower() == "true"

    logging.basicConfig(level=cfg.log_level, format='%(name)s: %(levelname)s - %(message)s')
    logging.debug("Configuration: %s", cfg)

    wz_log = logging.getLogger("werkzeug")
    wz_log.setLevel(cfg.log_level)

    dist_path = os.path.join(os.path.dirname(__file__), "../frontend/dist")
    app = Flask("photo-analyzer", static_folder=os.path.join(dist_path, "assets"), template_folder=dist_path)
    Minify(app, html=True, js=True, cssless=True)

    CORS(app)
    app.config['CORS_HEADERS'] = 'Content-Type'

    app.logger.addHandler(default_handler)
    app.logger.setLevel(cfg.log_level)

    service = ImageService(app, os.getcwd())

    @app.route("/")
    def index():
        return render_template("index.html")


    @app.route("/api/directory", methods=["GET"])
    def get_current_directory():
        return jsonify(service.get_current_directory())


    @app.route("/api/directory/files", methods=["GET"])
    def list_content_of_directory():
        return jsonify(service.get_files_and_directories())


    @app.route("/api/directory", methods=["POST"])
    def change_directory():
        path = request.args.get("path")
        if path == None:
            return jsonify({"error": "No path given"}), 400
        service.change_directory(path)
        return jsonify(service.get_current_directory())


    @app.route("/api/directory/images", methods=["GET"])
    def list_images_of_directory():
        return jsonify(service.get_images())


    if cfg["app.debug"] == True:
        app.run(host=cfg["app.host"], port=cfg["app.port"], debug=cfg["app.debug"], use_reloader=True)
    else:
        http_server = WSGIServer((cfg["app.host"], cfg["app.port"]), app)
        http_server.serve_forever()


if __name__ == '__main__':
    main()
