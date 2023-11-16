from PIL import Image
import exiftool
import os


class ImageService:

    def __init__(self, app, initial_path, ai_enabled=True):
        self.directory = initial_path
        self.app = app
        self.ai_enabled = ai_enabled

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
                exif_tool_path = os.path.join(os.path.dirname(__file__), "exiftool.exe")
                with exiftool.ExifToolHelper(executable=exif_tool_path) as et:
                    meta_data = et.get_metadata(os.path.join(directory, file))
                    if len(meta_data) == 0:
                        self.app.logger.warning("No metadata found for image %s", file)
                        continue
                    meta = meta_data[0]
                    images.append({
                        "name": meta.get("File:FileName"),
                        "exif": {
                            "model": meta.get("EXIF:Model"),
                            "manufacturer": meta.get("EXIF:Make"),
                            "software": meta.get("EXIF:Software"),
                            "aperture": meta.get("EXIF:FNumber"),
                            "exposure": meta.get("EXIF:ExposureTime"),
                            "iso": meta.get("EXIF:ISO"),
                            "datetime": meta.get("EXIF:DateTimeOriginal"),
                            "focal_length": meta.get("EXIF:FocalLength"),
                            "focal_length_35": meta.get("EXIF:FocalLengthIn35mmFormat"),
                            "lens": str(meta.get("EXIF:LensMake")) + " " + str(meta.get("EXIF:LensModel"))
                        }
                    })
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