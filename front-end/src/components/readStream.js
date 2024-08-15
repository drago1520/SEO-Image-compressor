

async function readStream(response, boundary = "--boundary") {
    const reader = response.body.getReader();
    const decoder = new TextDecoder('utf-8');
    // Get the boundary from the content-type header
    
    let done = false;
    let accumulatedData = '';
    while (!done) {
        const { value, done } = await reader.read();
        if (done) {
            break;
        }
        if(value){
        accumulatedData += decoder.decode(value, { stream: true });
        }
    }
    console.log('Stream has been fully read.');
    return fileParser(accumulatedData, boundary);
}

const fileParser = function(streamData, boundary) {
    let accumulatedData = streamData;
    const parts = accumulatedData.split(`${boundary}`);
    //С тази структура данни се надявам i да е еднакво иначе съм прецакан
    let filenNames = []; //['MTPH1416.jpg', 'няква снимка със знаци.jpg', 'снимка.gif']
    let contentTypes = [];
    let urlsTemp = [];
    let files = []; 
    parts.forEach((part, i) => {
        if(part){
            var [headerPart, fileContent] = part.split('\r\n\r\n');
            const headers = headerPart.split('\r\n');
            headers.forEach(header =>{
                if(header.startsWith('Content-Disposition')){
                    const filenameMatch = header.match(/filename="(.+?)"/);
                    if(filenameMatch){
                        filenNames.push(filenameMatch[1]) 
                    }
                }else if (header.startsWith('Content-Type')){
                    contentTypes.push(header.split(': ')[1])
                }
            });

            // Convert file content from binary string to a Uint8Array
            const binaryContent = new Uint8Array([...fileContent].map(char => char.charCodeAt(0)));
            const blob = new Blob([binaryContent], { type: contentTypes[i] });
            urlsTemp.push(URL.createObjectURL(blob));
        }
    })
    console.log(urlsTemp);
    console.log(filenNames);
    console.log(contentTypes);
    for(let i=0; i<filenNames.length;i++){
        files.push({url: urlsTemp[i], fileName: filenNames[i], contentType: contentTypes[i]})
    }

    return files
        

    













};

export default readStream;