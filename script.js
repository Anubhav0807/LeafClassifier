const apiUrl = "https://leaf-description.vercel.app";

// More API functions here:
// https://github.com/googlecreativelab/teachablemachine-community/tree/master/libraries/image

// the link to your model provided by Teachable Machine export panel
const URL = {
    A: "./modelA/",
    B: "./modelB/",
};

let model, webcam, maxPredictions;

let startTime, curTime;
let lastIdx, lastClass, lastFrameIdx, lastFrameClass;

// Load the image model and setup the webcam
async function init(event) {
    const modelURL = {
        A: URL.A + "model.json",
        B: URL.B + "model.json",
    };
    const metadataURL = {
        A: URL.A + "metadata.json",
        B: URL.B + "metadata.json",
    };

    // load the model and metadata
    // Refer to tmImage.loadFromFiles() in the API to support files from a file picker
    // or files from your local hard drive
    // Note: the pose library adds "tmImage" object to your window (window.tmImage)
    model = {
        A: await tmImage.load(modelURL.A, metadataURL.A),
        B: await tmImage.load(modelURL.B, metadataURL.B),
    };
    maxPredictions = {
        A: model.A.getTotalClasses(),
        B: model.B.getTotalClasses(),
    };

    // Convenience function to setup a webcam
    const flip = true; // whether to flip the webcam
    webcam = new tmImage.Webcam(200, 200, flip); // wilih, height, flip
    await webcam.setup(); // request access to the webcam
    await webcam.play();
    window.requestAnimationFrame(loop);

    // Remove the Start button
    const webcamContainer = document.getElementById('webcam-container');
    webcamContainer.removeChild(event.target);
    webcamContainer.classList.remove('container');

    // append elements to the DOM
    document.getElementById("webcam-container").appendChild(webcam.canvas);

    // Initialize the variables
    curTime = startTime = new Date().getTime();

    // Send a wake up call to the API to initiate cold start
    fetch(apiUrl); // Need not wait or store
}

async function loop() {
    webcam.update(); // update the webcam frame
    await predict();
    window.requestAnimationFrame(loop);
}

// run the webcam image through the image model
async function predict() {
    const progressBar = document.getElementById('scan');
    const delay = 2; // for consistency

    // predict can take in an image, video or canvas html element
    const predictionA = await model.A.predict(webcam.canvas);
    curTime = new Date().getTime();
    if (predictionA[0].probability < 0.8) {
        startTime = curTime;
        return; // if not a leaf, no need to classify it
    }

    const predictionB = await model.B.predict(webcam.canvas);
    let maxProb = 0;
    let curClass;
    let curIdx;
    for (let i = 0; i < maxPredictions.B; i++) {
        if (predictionB[i].probability > maxProb) {
            maxProb = predictionB[i].probability;
            curClass = predictionB[i].className;
            curIdx = i;
        }
    }

    if (curIdx === lastIdx) {
        startTime = curTime;
        progressBar.value = 100;
    } else if (curIdx === lastFrameIdx) {
        let diff = curTime - startTime;
        progressBar.value = Number.parseInt(diff / (delay * 10)).toString();
        if (diff > delay * 1000) {
            startTime = curTime;
            if (curIdx !== lastIdx) {
                lastClass = curClass;
                lastIdx = curIdx;
                renderDetails(curClass);
            }
        }
    } else {
        lastFrameIdx = curIdx;
        startTime = curTime;
    }
}

// Fetch list of leaves
async function getLeaves() {
    try {
        const response = await fetch(`${apiUrl}/leaf`);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        return data.available_leaves;
    } catch (error) {
        console.error("Error fetching leaves:", error);
        return null;
    }
}

// Fetch description of a specific leaf
async function describe(leaf) {
    try {
        const response = await fetch(`${apiUrl}/leaf/${leaf}`);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error fetching leaf:", error);
        return null;
    }
}

async function renderDetails(leaf) {
    // console.log("API called");
    const detailsContainer = document.getElementById('details-container');
    const details = await describe(leaf);
    const latinName = details.name.replace('_', ' ');
    const about = details.about;
    const characteristics = details.about.leaf_characteristics;

    detailsContainer.innerHTML = `
        <h1>${about.common_name} found!</h1>
        <p>${about.description}</p>
        <img class="leaf" src="${about.imageURL}" style="float: right;">
        <ul>
            <li><strong>Latin Name:</strong> ${latinName}</li>
            <li><strong>Shape:</strong> ${characteristics.shape}</li>
            <li><strong>Size:</strong> ${characteristics.size}</li>
            <li><strong>Texture:</strong> ${characteristics.texture}</li>
            <li><strong>Color:</strong> ${characteristics.color}</li>
            <li><strong>Arrangement:</strong> ${characteristics.arrangement}</li>
            <li><strong>Venation:</strong> ${characteristics.venation}</li>
        </ul>
        <p>
            ${about.note}<br>
            Click <a href="${about.wikiURL}" target="_blank">here</a> to visit the wiki page for ${about.common_name}
        </p>
    `;

    // console.log(JSON.stringify(details));
}