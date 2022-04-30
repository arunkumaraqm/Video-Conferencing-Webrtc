import { arrayBufferToBase64 } from "./Base64Utility";
var CHUNK_MAX = 16000;

function sendFile(file, dataChannel) {
	var reader = new FileReader();
	reader.onloadend = function (evt) {
		if (evt.target.readyState === FileReader.DONE) {
			var buffer = reader.result,
				start = 0,
				end = 0,
				last = false;

			function sendChunk() {
				end = start + CHUNK_MAX;
				if (end > file.size) {
					end = file.size;
					last = true;
				}
				let binaries = arrayBufferToBase64(buffer.slice(start, end));
				dataChannel.send(JSON.stringify({
					type: 'filesharing',
					content: binaries,
					identity: 'defualt person'
				})); // If this is the last chunk send our end message, otherwise keep sending        
				if (last === true) {
					dataChannel.send(JSON.stringify({
						type: "end"
					}));
				} else {
					start = end; // Throttle the sending to avoid flooding          
					setTimeout(function () {
						sendChunk();
					}, 100);
				}
			}
			sendChunk();
		}
	};
	reader.readAsArrayBuffer(file);
}

export  {sendFile};