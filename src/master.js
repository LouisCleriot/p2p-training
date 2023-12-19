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
      })
    ],
    services: {
      pubsub: gossipsub(),
      identify: identify()
    }
  }

const node = await createLibp2p(config)
const bootstrapperMultiaddrs = node.getMultiaddrs().map((m) => m.toString())

console.log('master node start with the address :', bootstrapperMultiaddrs)

//node.services.pubsub.addEventListener('message', (evt) => {
//  console.log(`${evt.detail.topic}:`, new TextDecoder().decode(evt.detail.data))
//})

node.services.pubsub.subscribe('trigger')

const stdin = process.openStdin()
stdin.addListener('data', (d) => {
  node.services.pubsub.publish('trigger', new TextEncoder().encode(d))
})

