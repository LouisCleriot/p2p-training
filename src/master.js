// MasterNode.js
import { createLibp2p } from 'libp2p'
import { tcp } from '@libp2p/tcp'
import { webSockets } from '@libp2p/websockets'
import { noise } from '@chainsafe/libp2p-noise'
import { mplex } from '@libp2p/mplex'
import { yamux } from '@chainsafe/libp2p-yamux'
import { identify } from '@libp2p/identify'
import { gossipsub } from '@chainsafe/libp2p-gossipsub'
import { pubsubPeerDiscovery } from '@libp2p/pubsub-peer-discovery'
import { mdns } from '@libp2p/mdns'
import { execPromise } from './train.js';



const config = {
    addresses: {
      listen: ['/ip4/0.0.0.0/tcp/0', '/ip4/0.0.0.0/tcp/0/ws']
    },
    transports: [tcp(), webSockets()],
    streamMuxers: [yamux(), mplex()],
    connectionEncryption: [noise()],
    peerDiscovery: [
      pubsubPeerDiscovery({
        interval: 1000
      }),
      mdns({
        interval: 2000,
        enabled: true
      }),
    ],
    services: {
      pubsub: gossipsub(),
      identify: identify(),
    },
  }

const node = await createLibp2p(config)
const bootstrapperMultiaddrs = node.getMultiaddrs().map((m) => m.toString())
const result = []

let number_return = 0
let number_return_training = 0
let number_training = 0
let number_return_test = 0
let number_test = 0

const hash_train = 'QmfXZKGMUAHFkSAiNefvkFuzjvhFMHHQTwKsJEkyrKd7Gk'
const hash_test_X = 'QmYYder9BZkmoNMnbeV1hGhBJvRKAmCM3HRNbVvBiatp8J'
const hash_test_Y = 'QmSTsJoVC2KvnWYFVh2RUwnggBQh1MvKTTmxMgtGmT2vun'


console.log('master node start with the address :', bootstrapperMultiaddrs)

node.services.pubsub.subscribe('node/model/train')//
node.services.pubsub.subscribe('node/model/test')
node.services.pubsub.subscribe('node/data/train')//
node.services.pubsub.subscribe('node/data/test')//
node.services.pubsub.subscribe('node/data/train/pined')//
node.services.pubsub.subscribe('node/data/test/pined')//
node.services.pubsub.subscribe('node/model/result/trained')
node.services.pubsub.subscribe('node/model/result/test')

////////////////////////////// Send Order //////////////////////////////
const stdin = process.openStdin()
stdin.addListener('data', (d) => {
  //start training the model
  if (d.toString().startsWith('train: ')) {
    number_training = number_return
    console.log(`there is ${number_training} node that will train`)
    d = d.toString().replace('train: ', '')
    node.services.pubsub.publish('node/model/train', new TextEncoder().encode(d))
  }
  //trigger worker to pin the train data
 else if (d.toString().startsWith('traindata')) {
    node.services.pubsub.publish('node/data/train', new TextEncoder().encode(hash_train))
  } 
  //trigger worker to pin the test data
  else if (d.toString().startsWith('testdata')) {
    d = d.toString().replace('testdata', '')
    node.services.pubsub.publish('node/data/test', new TextEncoder().encode(hash_test_X))
  }
  //trigger worker to test their model
  else if (d.toString().startsWith('test')) {
    number_test = number_return_training
    node.services.pubsub.publish('node/model/test', new TextEncoder().encode(d))
  }
  else if (d.toString().startsWith('reset')) {
    result.length = 0
  }
})

////////////////////////////// Receive message //////////////////////////////
node.services.pubsub.addEventListener('message', async (evt) => {
  //result of testing the model
  if (evt.detail.topic == 'node/model/result/test'){
    number_return_test = number_return_test +1
    console.log(`there is ${number_test - number_return_test} node still training`)
    let predict_Y = new TextDecoder().decode(evt.detail.data)
    predict_Y = predict_Y.split(',')
    let model_hash = predict_Y.pop()
    let true_Y = await execPromise(`ipfs cat ${hash_test_Y}`)
    true_Y = true_Y.split('\n')
    const sender = evt.detail.from
    const dict = {}
    dict["id"] = sender
    dict["accuracy"] = await accuracy(predict_Y, true_Y)
    dict["model_hash"] = model_hash
    result.push(dict)
    console.log(result)
  } 
  // notif train data is pined
  else if (evt.detail.topic == 'node/data/train/pined'){
    const msg = new TextDecoder().decode(evt.detail.data)
    number_return = number_return +1
    console.log(`there is ${number_return} node that pinned the data`)
  }
  else if (evt.detail.topic == 'node/data/test/pined'){
    const msg = new TextDecoder().decode(evt.detail.data)
    number_test = number_test +1
    console.log(`there is ${number_test} node that pinned the data`)
  }
  else if (evt.detail.topic == 'node/model/result/trained'){
    const msg = new TextDecoder().decode(evt.detail.data)
    number_return_training = number_return_training +1
    console.log(`there is ${number_training - number_return_training} node still training`)
  }
})

const accuracy = async (predictedLabels, trueLabels) => (predictedLabels.reduce((acc, cur, idx) => acc + (cur === trueLabels[idx] ? 1 : 0), 0) / predictedLabels.length) * 100;