// WorkerNode.js
import { createLibp2p } from 'libp2p'
import { noise } from '@chainsafe/libp2p-noise'
import { yamux } from '@chainsafe/libp2p-yamux'
import { mplex } from '@libp2p/mplex'
import { bootstrap } from '@libp2p/bootstrap'
import { gossipsub } from '@chainsafe/libp2p-gossipsub'
import { identify } from '@libp2p/identify'
import { tcp } from '@libp2p/tcp'
import { webSockets } from '@libp2p/websockets'
import { pubsubPeerDiscovery } from '@libp2p/pubsub-peer-discovery'
import { training, testing, pinData } from './train.js';
import { mdns } from '@libp2p/mdns'
import { kadDHT } from '@libp2p/kad-dht'

const bootstrapNode = ['/ip4/172.17.0.2/tcp/37479/p2p/12D3KooWMsMyBDiTZJbghQ5zLRR8WGRx3xMFg2qxyKUPaxtgBgDW','/ip4/127.0.0.1/tcp/37479/p2p/12D3KooWMsMyBDiTZJbghQ5zLRR8WGRx3xMFg2qxyKUPaxtgBgDW','/ip4/127.0.0.1/tcp/34545/ws/p2p/12D3KooWMsMyBDiTZJbghQ5zLRR8WGRx3xMFg2qxyKUPaxtgBgDW','/ip4/172.17.0.2/tcp/34545/ws/p2p/12D3KooWMsMyBDiTZJbghQ5zLRR8WGRx3xMFg2qxyKUPaxtgBgDW']
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
      bootstrap({
        list: bootstrapNode
      })
    ],
    services: {
      pubsub: gossipsub(),
      identify: identify(),
      dht: kadDHT({
        kBucketSize: 20,
        clientMode: false,
    }),
    },
  }
  
const connectedPeers = []
let train_hash 
let test_hash
let model_hash
const node = await createLibp2p(config)

console.log(`Id of this peer : ${node.peerId.toString()}`)

////////////////////////////// Event Peer //////////////////////////////
node.addEventListener('peer:connect', (evt) => {
    const peer = evt.detail
    console.log(`New connection: ${peer}`)
    connectedPeers.push(peer)
    console.log(`================connectedPeers================`)
    connectedPeers.forEach((peer) => {
        console.log(peer)
    })
    console.log(`==============================================`)
})

node.addEventListener('peer:disconnect', (evt) => {
    const peer = evt.detail
    console.log(`disconnected: ${peer}`)
    const index = connectedPeers.indexOf(peer)
    if (index > -1) {
      connectedPeers.splice(index, 1)
    }
    console.log(`================connectedPeers================`)
    connectedPeers.forEach((peer) => {
      console.log(peer)
    })
    console.log(`==============================================`)
})

////////////////////////////// Event Pubsub //////////////////////////////
node.services.pubsub.subscribe('result/trained')
node.services.pubsub.subscribe('predict')

node.services.pubsub.subscribe('node/data/train')//
node.services.pubsub.subscribe('node/data/test')//
node.services.pubsub.subscribe('node/model/train')//
node.services.pubsub.subscribe('node/model/test')//



node.services.pubsub.addEventListener('message', async (evt) => {
  //start training the model  
  if (evt.detail.topic == 'node/model/train'){
      const msg = new TextDecoder().decode(evt.detail.data)
      console.log(`${evt.detail.topic}:`, msg)
      model_hash = await training(msg, train_hash)
      node.services.pubsub.publish('node/model/result/trained', new TextEncoder().encode("trained"))
    }
  //start testing the model
  else if (evt.detail.topic == 'node/model/test'){
      console.log(`${evt.detail.topic}: start testing`)
      const results = await testing(test_hash)
      results.push(model_hash)
      node.services.pubsub.publish('node/model/result/test', new TextEncoder().encode(results))
    }
  //pin the train data
  else if (evt.detail.topic == 'node/data/train'){
      const msg = new TextDecoder().decode(evt.detail.data)
      console.log(`${evt.detail.topic}:`, msg)
      train_hash = await pinData(msg)
      console.log('data pined')
      node.services.pubsub.publish('node/data/train/pined', new TextEncoder().encode("pined"))
    }
  //pin the test data
  else if (evt.detail.topic == 'node/data/test'){
      const msg = new TextDecoder().decode(evt.detail.data)
      console.log(`${evt.detail.topic}:`, msg)
      test_hash = await pinData(msg)
      console.log('data pined')
      node.services.pubsub.publish('node/data/test/pined', new TextEncoder().encode("pined"))
    }
})
