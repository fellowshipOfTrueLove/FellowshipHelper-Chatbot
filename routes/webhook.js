module.exports = function(app, db) {
  app.post('/webhook', (req, res) => {
    console.log(req.body)
    res.send("Hello")
  });
};
