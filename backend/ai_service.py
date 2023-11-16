from keras.applications import resnet50, imagenet_utils
import tensorflow as tf
import os


class AiService:

    def __init__(self):
        self.model = resnet50.ResNet50(weights='imagenet')

    def get_image_motif(self, directory, file):
        img = tf.io.read_file(os.path.join(directory, file))
        decoded_img = tf.image.decode_image(img)
        resized_img = tf.image.resize(decoded_img, self.model.input_shape[1:3])
        img_batch = tf.expand_dims(resized_img, axis=0)
        preds = self.model.predict(img_batch)
        decodes_preds = imagenet_utils.decode_predictions(preds, top=1)
        return decodes_preds[0][0][1]