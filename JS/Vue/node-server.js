// TCP net模块 Server
// const net = require('net')

// // const server = new net.Server(sockets => {
// //   console.log('有客户端连接接入')
// //   sockets.write('向客户端发送消息')
// // })

// // const server = net.createServer(sockets => {
// //   console.log('有客户端连接接入')
// //   sockets.write('向客户端发送消息')
// // })

// const server = net.createServer()
// server.on('connection', socket => {
//   console.log('client has connectioned')
//   // socket.write('server send data to client')
//   socket.on('data',data => {
//     console.log('server has received from client data ', data)
//     socket.write('hello i am server')
//   })
//   socket.pipe(socket)
// })
// server.on('listening',() => {
//   console.log('listening')
// })
// server.on('close', () => {
//   console.log('server is closing')
// })
// server.on('error',err => {
//   console.log(err)
// })



// server.listen(8088,() => {
//   console.log('TCP服务启动')
// })

// UDP dgram模块 Server
const dgram = require('dgram')
// 方式1
// const UDPServer = new dgram.Socket({
//   type:'udp4'
// })
// 方式2
const UDPServer = dgram.createSocket('udp4')

UDPServer.on('listening',() => {
  console.log('UDPServer is listening ')
})
UDPServer.on('connect',() => {
  console.log('UDPServer is listening ')
})
UDPServer.on('message',(data,rinfo) => {
  console.log('UDPServer is message ',data.toString('utf8'),rinfo.address, rinfo.port)
  UDPServer.send('this msg from server',rinfo.port)
})
UDPServer.on('close',() => {
  console.log('UDPServer is close ')
})
UDPServer.on('err',err => {
  console.log('UDPServer is error ', err)
})

UDPServer.bind(8088)