import exiftool
import requests
import shutil
import os


class ExifService:

    def __init__(self, exif_tool_path=os.path.join(os.path.dirname(__file__), "exiftool.exe")):
        self.exif_tool_path = exif_tool_path
        if not os.path.exists(self.exif_tool_path):
            r = requests.get("https://exiftool.org/exiftool-12.72.zip", allow_redirects=True)
            zip_path = exif_tool_path + ".zip"
            open(zip_path, 'wb').write(r.content)
            shutil.unpack_archive(zip_path, os.path.join(os.path.dirname(__file__)))
            os.remove(zip_path)
            os.rename(os.path.join(os.path.dirname(__file__), "exiftool(-k).exe"), self.exif_tool_path)

    def get_metadata(self, directory, file):
        with exiftool.ExifToolHelper(executable=self.exif_tool_path) as et:
            meta_data = et.get_metadata(os.path.join(directory, file))
            if len(meta_data) == 0:
                self.app.logger.warning("No metadata found for image %s", file)
                raise LookupError("No metadata found for image")
            meta = meta_data[0]
            return {
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
            }