import * as tf from '@tensorflow/tfjs-node'
import { exec } from 'child_process'
import { get } from 'https'

let train_hash 
let test_hash 
let model_hash


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
    //check if there is only one in the array
    if (parsedData.length == 1) {
        const xs = tf.tensor2d([parsedData[0].features], [1, 4]);
        const speciesMap = { 'Iris-setosa': [1, 0, 0], 'Iris-virginica': [0, 1, 0], 'Iris-versicolor': [0, 0, 1] };
        const labelTensor = speciesMap[parsedData[0].label];
        const ys = tf.tensor2d([labelTensor], [1, 3]);
        return {xs, ys};
    }
    
    const xs = tf.tensor2d(parsedData.map(item => item.features));    
    const speciesMap = { 'Iris-setosa': [1, 0, 0], 'Iris-virginica': [0, 1, 0], 'Iris-versicolor': [0, 0, 1] };
    let ys = "bruh"
    try {
        ys = tf.tensor2d(parsedData.map(item => speciesMap[item.label]));
    } catch (error) {
        ys = "osef"
    }
    console.log("tensor created")
    return {xs, ys}
}


const model = tf.sequential()
model.add(tf.layers.dense({ units: 10, inputShape: [4], activation: 'relu' }))
model.add(tf.layers.dense({ units: 3, activation: 'softmax' }))
model.compile({ loss: 'categoricalCrossentropy', optimizer: 'adam' })

const training = async (msg, hash) => {
    const number = msg.split(',')[0].split('=')[1]
    let data = []
    train_hash = hash
    const command = `ipfs cat ${train_hash} | shuf -n 1`;

    for (let i = 0; i < number; i++) {
        try {
            const output = await execPromise(`ipfs cat ${train_hash} | shuf -n 1`);
            data.push(output);
        } catch (error) {
            console.error(error);
        }
    }
    const { xs: X, ys: Y } = await parsingData(data)

    // train model
    console.log("training model")
    await model.fit(X, Y, { epochs: 100 })
    console.log("model trained") 
    // save model 
    try {
        await model.save('file://./model')
    } catch (error) {
        console.log(error)
    }
    console.log("model saved")
    // pin model
    await promise(`ipfs add -r model/ | tail -n 1 | awk '{print $2}'`).then(({ stdout, stderr }) => {
        model_hash = stdout
    })
    
    return model_hash
}

const testing = async (test) => {
    let data = await execPromise(`ipfs cat ${test}`)
    data = data.split('\n')
    const { xs: X, ys: Y } = await parsingData(data)
    const result = model.predict(X)
    const resultArray = await result.array()
    const speciesMap = { 'Iris-setosa': 0, 'Iris-virginica': 1, 'Iris-versicolor': 2 };
    const speciesPredictions = resultArray.map(predictionArray => {
        const index = predictionArray.indexOf(Math.max(...predictionArray));
        const species = Object.keys(speciesMap).find(key => speciesMap[key] === index);
        return species;
    });
return speciesPredictions;
}

const pinData = async (data) => {
    console.log('searching for the data on ipfs')
    const hash_raw = await execPromise(`ipfs pin add ${data}`)
    let hash = hash_raw.split(' ')
    hash = hash[1]
    return hash
}


const promise = (cmd) => new Promise((resolve, reject) => {
    exec(cmd, (error, stdout, stderr) => {
        if (error) {
            reject(`Execution error: ${error}`);
        } else {
            resolve({ stdout: stdout.trim(), stderr: stderr.trim() });
        }
    });
});

export { training, testing, pinData, execPromise };
