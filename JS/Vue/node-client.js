// TCP net模块 Client
// const net = require('net')

// // const client = new net.Socket()
// // client.on('connect',() => {
// //   console.log('client is connected server')
// // })
// // client.connect({
// //   port:8088
// // })

// // const client = net.createConnection({port:8088},() => {
// //   console.log('client is connected server')
// // })

// const client = net.connect({
//   port:8088
// },() => {
//   console.log('client is connected server')
// })
// client.on('connect', () => {
//   console.log('client has connect to server')

//   client.write('client send data to server')
// })
// client.on('error',err => {
//   console.log('client err',err)
// })
// client.on('data',data => {
//   console.log('client received from server data:',data)
//   client.end()
// })
// client.on('end', () => {
//   console.log('client has disconnect server')
// })

// UDP dgram模块 Client

const dgram = require('dgram')

// const client = new dgram.Socket('udp4')
const client = dgram.createSocket('udp4')

client.send('this msg from client',8088,() => {
  console.log('client msg has sended')
})

client.on('message', (data,rinfo) => {
  console.log('client has received from server data ', data, rinfo.address, rinfo.port)
  client.close()
})
client.on('close',() => {
  console.log('client is close ')
})

