const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/authenticate');
// Require the controllers WHICH WE DID NOT CREATE YET!!
const deals_controller = require('../controllers/deals.controller');


// a simple test url to check that all of our files are communicating correctly.
router.get('/deals', deals_controller.deals_read);
router.get('/deals/user', authenticate.authenticate, deals_controller.deals_read_user);
router.get('/deals/:id', deals_controller.deals_readId);
router.get('/deals/:id/user', authenticate.authenticate, deals_controller.deal_user);
router.post('/deals/:id/comment', authenticate.authenticate, deals_controller.deal_user_addComment);
router.post('/deals', authenticate.authenticate, deals_controller.deals_create);
router.patch('/deals/:id', authenticate.authenticate, deals_controller.deals_update);
router.patch('/deals/:id/vote', authenticate.authenticate, deals_controller.deals_addvote);
router.patch('/deals/:id/removevote', authenticate.authenticate, deals_controller.deals_removevote);
router.patch('/deals/:id/dec', authenticate.authenticate, deals_controller.deals_decrement);
router.delete('/deals/:id', authenticate.authenticate, deals_controller.deals_delete);
module.exports = router;
