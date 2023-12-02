const amqp = require('amqplib')
const mysql = require('mysql')

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'rootpassword',
    database: 'orders',
})

connection.connect()

const sleep = (milliseconds) => {
    return new Promise(resolve => setTimeout(resolve, milliseconds))
}

const recieveOrder = async () => {
    try {
        const conn = await amqp.connect('amqp://admin:password@localhost:5672')
        const channel = await conn.createChannel()
        const queue = 'orders'

        await channel.assertQueue(queue, { durable: true }) // check both producer and consumer have same queue name 

        console.log("Consumer Running...");

        let counter = 0

        channel.prefetch(1) // 1 message per consumer

        channel.consume(queue, async (message) => {
            const orderData = JSON.parse(message.content.toString());

            console.log('Receive orderData', orderData)

            const sql = 'INSERT INTO orders SET ?'

            await sleep(10000) //หน่วงเวลา 10 วินาที (ทำอะไรซักอย่างอยู่j)

            connection.query(sql, orderData, (err, result) => {
                if (err) throw err
                counter++
                console.log('Order saved to database with ID: ', result.insertId, 'counter: ', counter)
                // consumer บอก queue ว่าชิ้นนี้เสร็จแล้ว = ชิ้นนี้โดนลบออกจาก queue ไป
                channel.ack(message)
            })
        })
    } catch (error) {
        console.log('error', error)
    }
}

recieveOrder()