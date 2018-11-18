const IPFS = require('ipfs')
const OrbitDB = require('orbit-db')
const OrbitConnect = require('../../orbit-connect/src/orbit-connect')
const OrbitKistore = require('../../orbit-kistore/src/orbit-kistore')

const DB_NAME = 'ki'
const PINNING_ROOM = 'ki'

const ipfsOptions = {
  EXPERIMENTAL: {
    pubsub: true
  }
}

function didToAddress (id) {
  const exploded = id.split(':')
  if (exploded.length !== 3) {
    throw new Error('invalid id')
  }
  return exploded[2]
}

function addressToDid (address) {
  return `did:ki:${address}`
}

class Identity {
  constructor (db) {
    this.db = db
  }

  get did () {
    return addressToDid(this.db.address.root)
  }

  set (key, value) {
    return this.db.set(key, value)
  }

  get (key) {
    return this.db.get(key)
  }
}

class Ki {
  constructor ({ keyAdapters, nodes } = {}) {
    const keystore = new OrbitKistore(keyAdapters)
    const ipfs = new IPFS(ipfsOptions)
    this.orbitdb = new OrbitDB(ipfs, null, { keystore })
    this.orbitConnect = new OrbitConnect(
      ipfs,
      nodes,
      PINNING_ROOM
    )
  }

  async createIdentity () {
    const db = await this.orbitdb.keyvalue(DB_NAME)
    this.orbitConnect.broadcastDb(db.address.root)
    return new Identity(db)
  }

  async getIdentity (id) {
    const address = didToAddress(id)
    const db = await this.orbitdb.keyvalue(`/orbitdb/${address}/${DB_NAME}`)
    return new Identity(db)
  }
}

module.exports = Ki
