import { useState } from "react"
import './App.scss'
import firebase from "firebase/compat/app"
import 'firebase/compat/auth'
import "firebase/storage"
import {
  getStorage,
  ref,
  listAll,
  getDownloadURL,
  deleteObject,
  uploadBytesResumable
} from 'firebase/storage'
import { useDropzone } from 'react-dropzone'
import { BiTrash } from "react-icons/bi"

const App = () => {
    const [images, setImages] = useState([])
    const [search, setSearch] = useState()
    const [imageUpload, setImageUpload] = useState([])
    const [cliente, setCliente] = useState()    
    const [uploadProgress, setUploadProgress] = useState()    
    const [imageZoom, setImageZoom] = useState()

    const firebaseConfig = {
        apiKey: "AIzaSyCDCuKXp-D5zHCeFHopDv-u_BlFgOqEWkc",
        authDomain: "upload-imagens-bfb46.firebaseapp.com",
        projectId: "upload-imagens-bfb46",
        storageBucket: "upload-imagens-bfb46.appspot.com",
        messagingSenderId: "1085247404906",
        appId: "1:1085247404906:web:eac5771c29860d6336c313"
      };
    
    firebase.initializeApp(firebaseConfig)

    /*****novo upload *******/
    const {getRootProps, getInputProps} = useDropzone({
      accepted: 'images/*',
      onDrop: (acceptedFile) => {
        const newFiles = acceptedFile.map(file => {
          return Object.assign(file, {
            preview: URL.createObjectURL(file)
          })
        })
        setImageUpload([
          ...imageUpload,
          ...newFiles
        ])      
      }    
    })  

    const handleRemoveFile = fileName => {
      const newFileState = imageUpload.filter(file => file.name !== fileName)
      setImageUpload(newFileState)
    }
            

    const listItem = () => {       
      setImages([])
      const storage = getStorage()    
      const listRef = ref(storage, search)       

      listAll(listRef)
        .then(res => {
          res.items.forEach((item) => {                         
            getDownloadURL(item)
            .then((url) => {                
                setImages(prevState => [...prevState, {url:url, referencia:item}])                  
            })               
          })            
        })          
        .catch(err => {
          alert(err.message);
        })        
    } 

    const handleUpload = (e) => {
      e.preventDefault()
      const storage = getStorage();
      
      // Upload file and metadata to the object 'images/mountains.jpg'
      const formData = new FormData()
      imageUpload.forEach(file => {
        const storageRef = ref(storage, `${cliente}/` + file.name);
        const uploadTask = uploadBytesResumable(storageRef, file);

        // Listen for state changes, errors, and completion of the upload.
        uploadTask.on('state_changed',
          (snapshot) => {
            // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            setUploadProgress(progress)          
            switch (snapshot.state) {
              case 'paused':
                console.log('Upload is paused');
                break;
              case 'running':
                console.log('Upload is running');
                break;
            }
          },
          (error) => {
            // A full list of error codes is available at
            // https://firebase.google.com/docs/storage/web/handle-errors
            switch (error.code) {
              case 'storage/unauthorized':
                // User doesn't have permission to access the object
                break;
              case 'storage/canceled':
                // User canceled the upload
                break;

              // ...

              case 'storage/unknown':
                // Unknown error occurred, inspect error.serverResponse
                break;
            }
          },
          () => {
            // Upload completed successfully, now we can get the download URL
            getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {            
              setUploadProgress()
            });
          } 
        )
      })      
    }           
      

    const handleDelete = (image) => {      
      const storage = getStorage()

      // Create a reference to the file to delete
      const desertRef = ref(storage, `${image}`);

      // Delete the file
      deleteObject(desertRef).then(() => {
        console.log(desertRef)        
        setImages([])
        listItem()
      }).catch((error) => {
        console.log(error)
      });
    }
        
    return(
        <div className='container'>
            <div className='uploadImages'>
            <h3>Subir imagens</h3>
              <form onSubmit={handleUpload}>
                  <input type='text' placeholder='Nome do Cliente' onChange={(event) => setCliente(event.target.value)} />
                  {/*<input type="file" className="input" onChange={(event) => setImageUpload(event.target.files[0])}  />*/}

                {/******Novo upload******/}
                <div className='thumbsContainer'>
                    <div className='dropzone' {...getRootProps()}>
                      <input {...getInputProps()} />
                      <p>
                        Clique para adicionar ou arraste a imagem aqui.
                      </p>
                    </div>
                    {
                      imageUpload && 
                      imageUpload.map(file => (
                        <div 
                          key={file.name}
                          className='thumb' 
                          style={{backgroundImage:`url(${file.preview})`}}
                        >
                          <div className='mask' >
                            <BiTrash className='maskTrash' color='white' size='2em' onClick={() => handleRemoveFile(file.name)} />
                          </div>
                        </div> 
                      ))
                    }       
                </div>


                  <button type="submit">Upload</button>
              </form>
              {
                uploadProgress &&
                <p>Upload is {uploadProgress}% done</p>
              }
            </div>
            <div className='listImages'>
              <h3>Listar imagens</h3>
              <input onChange={(event) => setSearch(event.target.value)} />
              <button onClick={()=>listItem()}>List</button>            
              <div className='images'>
                {
                    images &&
                    images.map((image, index) => (
                      <div className='content'>
                        <img key={index} src={image.url} alt='imagem geral' onClick={()=>setImageZoom(image.url)} />        
                        <button onClick={()=>handleDelete(image.referencia)}>Excluir Imagem</button>
                      </div>
                    ))
                }
              </div> 
            </div>           
            {
              imageZoom &&
              <div className='zoom' >
                <div className='close'>
                  <img src={imageZoom} alt='imagem' />
                  <p onClick={()=>setImageZoom(false)}>Fechar</p>
                </div>
              </div>
            }
        </div>
    )
}

export default App