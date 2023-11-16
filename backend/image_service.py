from exif_service import ExifService
from ai_service import AiService
from PIL import Image
import os


class ImageService:

    def __init__(self, app, initial_path, ai_enabled=True):
        self.directory = initial_path
        self.app = app
        self.ai_enabled = ai_enabled
        self.exif_service = ExifService()
        if self.ai_enabled:
            self.ai_service = AiService()

    def get_current_directory(self):
        return self.directory

    def get_images(self):
        return self.__get_images(self.directory, 10)

    def __get_images(self, directory, remaining_depth=0):
        images = []
        for file in os.listdir(directory):
            if os.path.isfile(os.path.join(directory, file)):
                try:
                    Image.open(os.path.join(directory, file))
                except IOError:
                    self.app.logger.warning("File %s is not an image", file)
                    continue
                try:
                    images.append(self.exif_service.get_metadata(directory, file))
                except LookupError:
                    continue
                if self.ai_enabled:
                    images[-1]["motif"] = self.ai_service.get_image_motif(directory, file)
            elif remaining_depth > 0:
                images.extend(self.__get_images(os.path.join(directory, file), remaining_depth - 1))
        return images

    def change_directory(self, directory):
        if len(directory.split(os.path.sep)) > 1:
            self.directory = directory
        elif directory == "..":
            self.directory = os.path.dirname(self.directory)
        else:
            self.directory = os.path.join(self.directory, directory)

    def get_files_and_directories(self):
        files = [{"name": "..", "isFile": False}]
        files.extend([{"name": f, "isFile": os.path.isfile(os.path.join(self.directory, f))} for f in os.listdir(self.directory)])
        return files