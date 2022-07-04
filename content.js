console.log('Inverting images..')

const getNoTransformImage = function () {
    const img = new Image();
    img.src = 'cant-transform-image.jpg'
    return img;
};

const blobToDataURLPromise = function (blob) {
    return new Promise((resolve, reject) => {
        let reader = new FileReader();
        reader.onerror = (error) => {
            reject(error);
        }
        reader.onload = (event) => {
            resolve(event.target.result);
        }
        reader.readAsDataURL(blob);
    });
}

const invertCanvas = function (canvas) {
    let ctx = canvas.getContext('2d');
    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < imgData.data.length; i += 4) {
        imgData.data[i] = 255 - imgData.data[i];
        imgData.data[i + 1] = 255 - imgData.data[i + 1];
        imgData.data[i + 2] = 255 - imgData.data[i + 2];
        imgData.data[i + 3] = 255;
    }
    ctx.putImageData(imgData, 0, 0);
}

const getInvertedImage = function (img, usedCreateImageBitmap) {
    return usedCreateImageBitmap(img).then((imageBitmap) => {
        let canvas = new OffscreenCanvas(imageBitmap.width, imageBitmap.height);
        let ctx = canvas.getContext('2d');
        ctx.drawImage(imageBitmap, 0, 0);

        invertCanvas(canvas);

        return canvas.convertToBlob({type: 'image/jpg'});
    }).then((blob) => {
        return blobToDataURLPromise(blob);
    }).then((dataUrl) => {
        var changedImg = new Image();
        changedImg.src = dataUrl;
        return changedImg;
    }).catch((error) => {
        console.log('');
        console.log('CONVERT IMAGE ERROR');
        console.log(img);
        console.log(img.src);
        console.error(error);
        return getNoTransformImage();
    });
}

const createDomImageBitmap = function (image) {
    return new Promise((resolve, reject) => {
        chrome.runtime.sendMessage({url: image.currentSrc}, (response) => {
            new Promise((imgResolve, imgReject) => {
                let loadedImg = new Image()
                loadedImg.onload = () => {
                    imgResolve(loadedImg);
                }
                loadedImg.onerror = (err) => {
                    imgReject(err);
                }
                loadedImg.src = response.data;
            }).then((loadedImg) => {
                resolve(createImageBitmap(loadedImg));
            }).catch((err) => {
                reject(err);
            })
        });
    });
}

Array.from(document.images).forEach(function (img) {
    getInvertedImage(img, createImageBitmap).then((changedImg) => {
        img.parentElement.nextElementSibling.appendChild(changedImg);
    })

    getInvertedImage(img, createDomImageBitmap).then((changedImg) => {
        img.parentElement.nextElementSibling.nextElementSibling.appendChild(changedImg);
    })
});