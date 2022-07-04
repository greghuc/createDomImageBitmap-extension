chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        fetch(request.url).then((response) => {
            return response.ok ? response.blob() : null;
        }).then((maybeBlob) => {
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onerror = (error) => {
                    reject(error);
                }
                reader.onload = (event) => {
                    resolve(event.target.result);
                }
                reader.readAsDataURL(maybeBlob);
            });
        }).then((dataUrl) => {
            sendResponse({url: request.url, data: dataUrl});
        }).catch((err) => {
            sendResponse({url: request.url, error: err});
        });

        return true;
    }
);