module.exports = function(input) {
  const {req, res, app, db} = input;

  console.log(req.body)
  res.send("Hello")
};
