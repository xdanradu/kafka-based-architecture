import { KafkaClient, Consumer, HighLevelProducer } from 'kafka-node';

function KafkaRPC(){
  self = this;
  this.connection = new ConnectionProvider;
  this.requests = {}; //hash to store request in wait for response
  this.response_queue = false; //placeholder for the future queue
  this.producer = this.connection.getProducer();
}

KafkaRPC.prototype.makeRequest = function(topic_name, content, callback){
  self = this;
  //generate a unique correlation id for this call
  let correlationId = (Math.random()).toString(16);// crypto.randomBytes(16).toString('hex');

  //create a timeout for what should happen if we don't get a response
  let tId = setTimeout(function(corr_id){
    //if this ever gets called we didn't get a response in a
    //timely fashion
    console.log('timeout');
    callback(new Error("timeout " + corr_id));
    //delete the entry from hash
    delete self.requests[corr_id];
  }, TIMEOUT, correlationId);

  //create a request entry to store in a hash
  var entry = {
    callback:callback,
    timeout: tId //the id for the timeout so we can clear it
  };

  //put the entry in the hash so we can match the response later
  self.requests[correlationId]=entry;

  //make sure we have a response topic
  self.setupResponseQueue(self.producer,topic_name,function(){
    console.log('Setting up Response Queue');
    console.log('Topic Name : '+topic_name);
    //put the request on a topic

    var payloads = [{
      topic: topic_name,
      messages: JSON.stringify({
        correlationId:correlationId,
        replyTo:'response_topic',
        data:content}),
      partition:0}
    ];
    console.log('Setting up Response Queue : Payloads added');
    console.log('Producer Ready --> ' +self.producer.ready);
    self.producer.send(payloads, function(err, data){
      console.log('Setting up Response Queue : Response received');
      if(err)
        console.log('Setting up Response Queue : Error occurred' +err);
      console.log('Setting up Response Queue : Data received'+data);
      console.log(data);
    });
  });
};


KafkaRPC.prototype.setupResponseQueue = function(producer,topic_name, next){
  //don't mess around if we have a queue
  if(this.response_queue) return next();
  console.log('Inside Setup Response Queue');
  self = this;
  //subscribe to messages
  let consumer = self.connection.getConsumer('response_topic');
  consumer.on('message', function (message) {
    console.log('Consumer REST api: Message received from Kafka');
    let data = JSON.parse(message.value);
    //get the correlationId
    let correlationId = data.correlationId;
    //is it a response to a pending request
    if(correlationId in self.requests){
      //retrieve the request entry
      let entry = self.requests[correlationId];
      //make sure we don't timeout by clearing it
      clearTimeout(entry.timeout);
      //delete the entry from hash
      delete self.requests[correlationId];
      //callback, no err
      entry.callback(null, data.data);
    }
  });
  self.response_queue = true;
  return next();
};


//make request to kafka
function executeKafkaRequest(queue_name, msg_payload, callback) {
    console.log('Backend Client : Inside make request');
    console.log('Message to be sent : ' +msg_payload);
  new KafkaRPC().makeRequest(queue_name, msg_payload, function(err, response){

		if(err) {
			console.log(response);
			console.log("Error has occurred in make request");
			console.error(err);
		}
		else{
			console.log("Response from Kafka Backend : ", response);
			callback(null, response);
		}
	});
}


function ConnectionProvider() {
  this.getConsumer = function(topic_name) {
    this.client = new KafkaClient("localhost:2181");
    this.kafkaConsumerConnection = new Consumer(this.client,[ { topic: topic_name, partition: 0 }]);
    this.client.on('ready', function () { console.log('Client Ready >> with ',topic_name) })
    return this.kafkaConsumerConnection;
  };

  //Code will be executed when we start Producer
  this.getProducer = function() {

    if (!this.kafkaProducerConnection) {
      this.client = new KafkaClient("localhost:2181");
      this.kafkaProducerConnection = new HighLevelProducer(this.client);
      //this.kafkaConnection = new kafka.Producer(this.client);
      console.log('Backend Producer is ready');
    }
    return this.kafkaProducerConnection;
  };
}


let TIMEOUT=8000; //time to wait for response in ms
let self;

export { executeKafkaRequest };
