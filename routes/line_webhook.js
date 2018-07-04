module.exports = function(input) {
  const {req, res, app, db} = input;
  
  console.log(req.body.events) // req.body will be webhook event object
  res.send("Hello")
};
