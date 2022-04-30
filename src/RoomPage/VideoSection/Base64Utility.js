function arrayBufferToBase64(buffer) {
	var binary = '';
	var bytes = new Uint8Array(buffer);
	var len = bytes.byteLength;
	for (var i = 0; i < len; ++i) {
		binary += String.fromCharCode(bytes[i]);
	}
	return btoa(binary);
}

function base64ToBlob(b64Data, contentType) {
	contentType = contentType || '';
	var byteArrays = [], byteNumbers, slice;
	for (var i = 0; i < b64Data.length; i++) {
		slice = b64Data[i];
		byteNumbers = new Array(slice.length);
		for (var n = 0; n < slice.length; ++n) {
			byteNumbers[n] = slice.charCodeAt(n);
		}
		var byteArray = new Uint8Array(byteNumbers);
		byteArrays.push(byteArray);
	}

	var blob = new Blob(byteArrays, { type: contentType });
	return blob;
}

export {
	base64ToBlob,
	arrayBufferToBase64
}