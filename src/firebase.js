import firebase from "firebase/compat/app"
import 'firebase/compat/auth'
import "firebase/storage"
import {getStorage, ref} from 'firebase/storage'

const firebaseConfig = {
    apiKey: "AIzaSyCDCuKXp-D5zHCeFHopDv-u_BlFgOqEWkc",
    authDomain: "upload-imagens-bfb46.firebaseapp.com",
    projectId: "upload-imagens-bfb46",
    storageBucket: "upload-imagens-bfb46.appspot.com",
    messagingSenderId: "1085247404906",
    appId: "1:1085247404906:web:eac5771c29860d6336c313"
  };

firebase.initializeApp(firebaseConfig)
const storage = getStorage()

const storageRef = ref()

storageRef.listAll().then(res => {
  console.log(res.items)
})

export {storage, firebase as default}