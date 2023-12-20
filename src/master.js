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
      mdns({
        interval: 2000,
        enabled: true
      })
    ],
    services: {
      pubsub: gossipsub(),
      identify: identify()
    }
  }

const node = await createLibp2p(config)
const bootstrapperMultiaddrs = node.getMultiaddrs().map((m) => m.toString())
const result = []

console.log('master node start with the address :', bootstrapperMultiaddrs)

//node.services.pubsub.addEventListener('message', (evt) => {
//  console.log(`${evt.detail.topic}:`, new TextDecoder().decode(evt.detail.data))
//})

node.services.pubsub.subscribe('trigger')
node.services.pubsub.subscribe('result')
node.services.pubsub.subscribe('predict')

const stdin = process.openStdin()
stdin.addListener('data', (d) => {
  if (d.toString().startsWith('train: ')) {
    d = d.toString().replace('train: ', '')
    node.services.pubsub.publish('trigger', new TextEncoder().encode(d))
  } else if (d.toString().startsWith('predict')) {
    d = d.toString().replace('predict: ', '')
    node.services.pubsub.publish('predict', new TextEncoder().encode(d))
  } 
})

node.services.pubsub.addEventListener('message', async (evt) => {
  // check if the message is from subscribed topic
  if (evt.detail.topic == 'result'){
    const msg = new TextDecoder().decode(evt.detail.data)
    result.push(msg)
    console.log(result)
  }
})