const amqp = require('amqplib')
const { v4: uuidv4 } = require('uuid')

const sendOrder = async (orderData) => {
    // console.log('orderData', orderData)
    try {
        const connection = await amqp.connect('amqp://admin:password@localhost:5672')
        // create channel
        const channel = await connection.createChannel()
        const queue = 'orders'

        await channel.assertQueue(queue, { durable: true }) // assertQueue: if queue not exist, create new queue

        const BufferData = Buffer.from(JSON.stringify(orderData))

        channel.sendToQueue(queue, BufferData, { persistent: true })
        // Already send message to queue

        console.log('Message sent to queue Completed !', orderData)

        setTimeout(() => {
            connection.close()
            process.exit(0)
        }, 500)
    } catch (error) {
        console.log('error', error)
    }

}

for (let i = 0; i < 100; i++) {
    const orderData = {
        orderNumber: uuidv4(),
        productName: 'Laptop',
        quantity: 4,
    }
    sendOrder(orderData)
}