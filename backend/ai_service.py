from keras.models import load_model
import tensorflow as tf
import pickle as pkl
import numpy as np
import os


class AiService:

    def __init__(self):
        self.categories = pkl.load(open(os.path.join(os.path.dirname(__file__), 'model', 'categories.pkl'), 'rb'))
        self.model = load_model(os.path.join(os.path.dirname(__file__), 'model', 'resnet50_motif.h5'))

    def get_image_motif(self, directory, file):
        img = tf.io.read_file(os.path.join(directory, file))
        decoded_img = tf.image.decode_image(img)
        resized_img = tf.image.resize(decoded_img, (224, 224))
        img_batch = tf.expand_dims(resized_img, axis=0)
        preds = self.model.predict(img_batch)
        decoded_preds = np.argmax(preds, axis=1)[0]
        return self.categories[decoded_preds]