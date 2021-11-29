function handle_request(msg, callback){
  console.log(msg + 'received');
  console.log("Response from the database for todos")
  callback(null, [{id: 1, name: 'test1'}, {id: 2, name: 'test2'}]);
};

exports.handle_request = handle_request;
