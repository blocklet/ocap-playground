const Notification = require('@blocklet/sdk/service/notification');

module.exports = {
  init(app) {
    app.post('/api/notification', (req, res) => {
      const { type, content, actions = [] } = req.body.data;
      const did = req.user && req.user.did;

      const args = [did, type, content];
      if (actions && actions.length) {
        args.push({ actions });
      }

      Notification.sendToUser(...args)
        .then(() => {
          res.status(200).end();
        })
        .catch(err => {
          res.statusMessage = err.message;
          res.status(400).end();
        });
    });
  },
};
