import React, { useEffect, useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import './App.css';
import 'react-toastify/dist/ReactToastify.css';

export default function App() {
  const [IsDraging, setIsDraging] = useState(false)


  // https://github.com/LuanEdCosta/copy-image-clipboard/blob/master/src/index.ts
  const createImageElement = async (imageSource) => {
    return new Promise(function (resolve, reject) {
      const imageElement = document.createElement('img')
      imageElement.crossOrigin = 'anonymous'
      imageElement.src = imageSource

      imageElement.onload = function (event) {
        const target = event.target
        resolve(target)
      }

      imageElement.onabort = reject
      imageElement.onerror = reject
    })
  }

  const getBlobFromImageElement = async (imageElement) => {
    return new Promise(function (resolve, reject) {
      const canvas = document.getElementById("canvas");
      const ctx = canvas.getContext("2d");
      const oc = document.createElement('canvas')
      const octx = oc.getContext('2d');
      if (ctx) {
        const { width, height } = imageElement
        const ratio = width / height;
        const resizeWidth = 1024;

        canvas.width = resizeWidth
        canvas.height = resizeWidth / ratio

        // step 1 - resize to 50%
        oc.width = resizeWidth;
        oc.height = resizeWidth / ratio;
        octx.drawImage(imageElement, 0, 0, oc.width, oc.height);

        // step 2
        octx.drawImage(oc, 0, 0, oc.width, oc.height);

        // step 3, resize to final size
        ctx.drawImage(oc, 0, 0, oc.width, oc.height,
          0, 0, canvas.width, canvas.height);

        canvas.toBlob(
          function (blob) {
            if (blob) resolve(blob)
            else reject('Cannot get blob from image element')
          },
          'image/png',
          1,
        )
      }
    })
  }

  const convertBlobToPng = async (imageBlob) => {
    const imageSource = URL.createObjectURL(imageBlob)
    const imageElement = await createImageElement(imageSource)
    return await getBlobFromImageElement(imageElement)
  }

  const copyBlobToClipboard = async (blob) => {
    await navigator.clipboard.write([
      new ClipboardItem({
        [blob.type]: blob
      })
    ])
  }

  const copyPicture = async (url) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const pngBlob = await convertBlobToPng(blob)
      const copyImage = await copyBlobToClipboard(pngBlob)
      console.log('Image copied.');
      return copyImage
    } catch (err) {
      console.error(err.name, err.message);
      return err
    }
  };

  const uploadFiles = (e) => {
    const { files } = e.target

    if (files?.length === 0) {
      alert("Please first choose or drop any file(s)...");
      return;
    }
    
    let uploadContainer = document.getElementById("upload-container")
    uploadContainer.style.minHeight = "unset";

    const img = new Image();

    img.onload = async function () {
      await toast.promise(
        copyPicture(img.src),
        {
          pending: 'Resizing',
          success: 'Resized',
          error: 'Error Resized'
        }
      )
    };
    img.src = URL.createObjectURL(files[0]);

  }

  const handleChangeDataBefore = (IsDraging = false) => {
    setIsDraging(IsDraging)
  }

  useEffect(() => {
    handleChangeDataBefore();
  }, [])

  return (
    <div className="App">
      <div className="upload-container" id="upload-container">
        <div className="input-group">
          <input className="input" type="file" id="file_upload"
            onChange={uploadFiles}
          //  onDragEnter={handleDrag} 
          //  onDragLeave={handleDragLeave} 
          />
          <span className={`text ${IsDraging ? '-draging' : ''}`}>{IsDraging ? "Drop here." : "(or) Drag and Drop files here."}</span>
        </div>
      </div>
      <br />
      <ToastContainer autoClose={1000} />
      <canvas id="canvas" width={1024}></canvas>
    </div>
  );
}
