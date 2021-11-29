let getTodos = require('./services/getTodos');
let connection = require('./connection/kafka');
let mysqlConnection = require('./connection/mysql');
//connect to MySQL here creating using a request pool

function handleTopicRequest(topic_name, fname){
  //var topic_name = 'root_topic';
  let consumer = connection.getConsumer(topic_name);
  let producer = connection.getProducer();
  console.log('Kafka Backend : Server is running ');
  console.log('Topic Request handler attached with ',topic_name);
  consumer.on('message', function (message) {
    console.log('Message received for ' + topic_name +" ", fname);
    console.log(JSON.stringify(message.value));
    let data = JSON.parse(message.value);

    fname.handle_request(data.data, function(err,res){
      console.log('Request has been handled by the Kafka server');
      console.log('After Request is handled in Kafka : '+res);
      let payloads = [
        { topic: data.replyTo,
          messages:JSON.stringify({
            correlationId:data.correlationId,
            data : res
          }),
          partition : 0
        }
      ];
      producer.send(payloads, function(err, data){
        console.log('Kafka-Backend : Inside server file : '+data);
      });
      return;
    });

  });
}
handleTopicRequest("get_todos",getTodos);

