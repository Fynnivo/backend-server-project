import { 
    getProductById, 
    getPriceById, 
    getSubscription,
    createSubscription,
    createCustomer,
    createSessionPortal,
    retrieveCheckoutSessionLineItems,
    retrieveCheckoutSession,
    getSubscriptionById,
    createPortalSession,
    deleteSubscriptionById
} from "../controllers/StripeController.js";
import express from "express";

const router = express.Router();

router.get('/v1/subscription', getSubscription)
router.get("/v1/products/:id", getProductById);
router.get("/v1/prices/:id", getPriceById);
router.get("/v1/checkout/sessions/:id/line_items", retrieveCheckoutSessionLineItems)
router.get("/v1/checkout/sessions/:id", retrieveCheckoutSession)
router.get("/v1/subscription/:id", getSubscriptionById)

router.post("/create-portal-session", createPortalSession)
router.post("/create-subscription", createSubscription)
router.post("/create-checkout-session", createSessionPortal)
router.post('/v1/customers', createCustomer)

router.delete('v1/susbcription/:id', deleteSubscriptionById)


export default router;
