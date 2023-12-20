import * as tf from '@tensorflow/tfjs'
import { exec } from 'child_process'

const execPromise = (cmd) => new Promise((resolve, reject) => {
    exec(cmd, (error, stdout, stderr) => {
        if (error) {
            reject(`Execution error: ${error}`);
        } else if (stderr) {
            reject(`Error: ${stderr}`);
        } else {
            resolve(stdout.trim());
        }
    });
});

const parsingData = async (data) => {
    const parsedData = data.map(item =>{
        const parts = item.split(',');
        return {
            features: parts.slice(0, 4).map(Number), // Convert feature strings to numbers
            label: parts[4]
        };
    });
    //check if there is only one element in the array
    if (parsedData.length == 1) {
        const xs = tf.tensor2d([parsedData[0].features], [1, 4]);
        const speciesMap = { 'Iris-setosa': [1, 0, 0], 'Iris-virginica': [0, 1, 0], 'Iris-versicolor': [0, 0, 1] };
        const labelTensor = speciesMap[parsedData[0].label];
        const ys = tf.tensor2d([labelTensor], [1, 3]);
        return {xs, ys};
    }
    
    const xs = tf.tensor2d(parsedData.map(item => item.features));    
    const speciesMap = { 'Iris-setosa': [1, 0, 0], 'Iris-virginica': [0, 1, 0], 'Iris-versicolor': [0, 0, 1] };
    const ys = tf.tensor2d(parsedData.map(item => speciesMap[item.label]));
    console.log("tensor created")
    return {xs, ys}
}


const model = tf.sequential()
model.add(tf.layers.dense({ units: 10, inputShape: [4], activation: 'relu' }))
model.add(tf.layers.dense({ units: 3, activation: 'softmax' }))
model.compile({ loss: 'categoricalCrossentropy', optimizer: 'adam' })

const training = async (msg) => {
    const number = msg.split(',')[0].split('=')[1]
    let data = []
    const hash = 'QmcxbDmv9gJ5ck5UskpFfevNCYZRKn1A9Ux4jLGFtGQ8s9'
    const command = `ipfs cat ${hash} | shuf -n 1`;

    for (let i = 0; i < number; i++) {
        try {
            const output = await execPromise(`ipfs cat ${hash} | shuf -n 1`);
            data.push(output);
        } catch (error) {
            console.error(error);
        }
    }
    console.log(`Data length: ${data.length}`);
    console.log(`Data: ${data}`);
    const { xs: X, ys: Y } = await parsingData(data)
    console.log(`X shape: ${X.shape}`);
    console.log(`Y shape: ${Y.shape}`);

    // train model
    console.log("training model")
    await model.fit(X, Y, { epochs: 100 })
    console.log("model trained") 
}

const predict = async (test) => {
    const data = [test.trim()]
    const { xs: X, ys: Y } = await parsingData(data)
    const result = model.predict(X)
    const resultArray = await result.array()
    const speciesMap = { 'Iris-setosa': 0, 'Iris-virginica': 1, 'Iris-versicolor': 2 };
    const index = resultArray[0].indexOf(Math.max(...resultArray[0]))
    const species = Object.keys(speciesMap).find(key => speciesMap[key] === index)
    return species
}


export { training, predict };
