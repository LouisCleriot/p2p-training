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
import { training, predict } from './train.js';

const bootstrapNode = ['/ip4/127.0.0.1/tcp/36595/p2p/12D3KooW9t3pF6ZxmpxCtfdtQhwNtdAyXN3Huq9PizERhfxWkXR4']
const config = {
    addresses: {
      listen: ['/ip4/0.0.0.0/tcp/0']
    },
    transports: [tcp(), webSockets()],
    streamMuxers: [yamux(), mplex()],
    connectionEncryption: [noise()],
    peerDiscovery: [
      pubsubPeerDiscovery({
        interval: 1000
      }),
      bootstrap({
        list: bootstrapNode
      })
    ],
    services: {
      pubsub: gossipsub(),
      identify: identify()
    },
  }
  
const connectedPeers = []

const node = await createLibp2p(config)

console.log(`Id of this peer : ${node.peerId.toString()}`)

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

//node.services.pubsub.addEventListener('message', (evt) => {
//    console.log(`${evt.detail.topic}:`, new TextDecoder().decode(evt.detail.data))
//})

node.services.pubsub.subscribe('trigger')
node.services.pubsub.subscribe('result')
node.services.pubsub.subscribe('predict')

node.services.pubsub.addEventListener('message', async (evt) => {
    // check if the message is from subscribed topic
    if (evt.detail.topic == 'trigger'){
      const msg = new TextDecoder().decode(evt.detail.data)
      console.log(`${evt.detail.topic}:`, msg)
      // parse the message 'NB=X, TYPE=Y'
      await training(msg)
    }
    if (evt.detail.topic == 'predict'){
      const msg = new TextDecoder().decode(evt.detail.data)
      console.log(`${evt.detail.topic}:`, msg)
      const result = await predict(msg)
      console.log(result)
      node.services.pubsub.publish('result', new TextEncoder().encode(result))
    }
})