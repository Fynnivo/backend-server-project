import stripe from "../config/Stripe.js";
import User from "../models/UserModel.js";

export const getProductById = async (req, res) => {
  try {
    const products = await stripe.products.retrieve(req.params.id);
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: error.message.data });
  }
};

export const getPriceById = async (req, res) => {
  try {
    const prices = await stripe.prices.retrieve(req.params.id);
    res.status(200).json(prices).unit_amount;
  } catch (error) {
    res.status(500).json({ message: error.message});
  }
};

export const getSubscriptionById = async (req, res) => {
  try {
    const subscription = await stripe.subscriptions.retrieve(req.params.id);
    res.status(200).json(subscription);
  } catch (error) {
    res.status(500).json({message: error.message});
  }
};

export const getSubscription = async(req, res) => {
  try {
    const subscriptions = await stripe.subscriptions.list()
    res.status(200).json(subscriptions)
  } catch (error) {
    res.status(500).json({message: error.message})
  }
}

export const deleteSubscriptionById = async(req, res) => {
  const subscriptionId = req.params.id
  try {
    const deleted = await stripe.subscriptions.del(subscriptionId)
    res.status(200).json(deleted)
  } catch (error) {
    res.status(400).json({message: error.message})
  }
}

export const createSubscription = async (req, res) => {
  const customer = await User.findOne({ uuid: req.session.userId });
  if (!customer)
    return res.status(400).json({ message: "Customer tidak ditemukan!" });

  try {
    // const customer = await stripe.customers.create({
    //   name: req.body.name,
    //   email: req.body.email,
    //   payment_method: req.body.payment_method,
    //   invoice_settings: {
    //     default_payment_method: req.body.payment_method,
    //   },
    // });
    await User.updateOne(
      { uuid: req.session.userId },
      {
        $set: {
          payment_method: req.body.payment_method,
          invoice_settings: {
            default_payment_method: req.body.payment_method,
          },
        },
      }
    );

    await stripe.customers.update(customer.customer_id, {
      payment_method: customer.payment_method,
      invoice_settings: {
        default_payment_method:
          customer.invoice_settings.default_payment_method,
      },
    });

    const priceId = req.body.priceId;

    const subscription = await stripe.subscriptions.create({
      customer: customer.customer_id,
      items: [{ price: priceId }],
      payment_settings: {
        payment_method_options: {
          card: {
            request_three_d_secure: "any",
          },
        },
        payment_method_types: ["card"],
        save_default_payment_method: "on_subscription",
      },
      expand: ["latest_invoice.payment_intent"],
    });
    return res.status(201).json({
      clientSecret: subscription.latest_invoice.payment_intent.client_secret,
      subscriptionId: subscription.id,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// export const createSubscription = async (req, res) => {
//   try {
//     const customer = await stripe.customers.create({
//       name: req.body.name,
//       email: req.body.email,
//       payment_method: req.body.payment_method,
//       invoice_settings: {
//         default_payment_method: req.body.payment_method
//       }
//     })

//     const priceId = req.body.priceId

//     //create the payment intent
//     const paymentIntent = await stripe.paymentIntents.create({
//       amount: req.body.amount,
//       currency: req.body.currency,
//       customer: customer.id,
//       payment_method: req.body.payment_method,
//       confirm: true,
//     });

//     //create the subscription
//     const subscription = await stripe.subscriptions.create({
//       customer: customer.id,
//       items: [{price: priceId}],
//       default_payment_method: req.body.payment_method,
//       expand: ['latest_invoice.payment_intent']
//     })
//     return res.status(201).json({
//       clientSecret: paymentIntent.client_secret,
//       subscriptionId: subscription.id
//     })
//   } catch (error) {
//     res.status(400).json({message: error.message})
//   }
// }

export const createCustomer = async (req, res) => {
  const user = await User.findOne({ uuid: req.session.userId });
  const { name, email } = req.body;
  try {
    if (user && user.customer_id === null) {
      const customer = await stripe.customers.create({
        name: name,
        email: email,
      });
      await User.updateOne(
        { uuid: req.session.userId },
        {
          customer_id: customer.id,
        }
      );
      res.status(201).json({ message: customer });
    } else return null;
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const createSessionPortal = async (req, res) => {
  try {
    const priceId = req.body.priceId;
    // const prices = await stripe.prices.retrieve(priceId);
    const session = await stripe.checkout.sessions.create({
      billing_address_collection: "auto",
      line_items: [
        {
          price: priceId,
          // For metered billing, do not pass quantity
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${process.env.CLIENT_HOST}/success/{CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_HOST}/canceled`,
    });

    res.json({ url: session.url });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const retrieveCheckoutSessionLineItems = async (req, res) => {
  try {
    const data = stripe.checkout.sessions.listLineItems(req.params.id);
    res.status(200).json({ data: (await data).data });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const retrieveCheckoutSession = async (req, res) => {
  try {
    const session = await stripe.checkout.sessions.retrieve(req.params.id);
    res.status(200).json({ session: session });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const createPortalSession = async (req, res) => {
  try {
    // For demonstration purposes, we're using the Checkout session to retrieve the customer ID.
    // Typically this is stored alongside the authenticated user in your database.
    const { session_id } = req.body;
    const checkoutSession = await stripe.checkout.sessions.retrieve(session_id);

    // This is the url to which the customer will be redirected when they are done
    // managing their billing with the portal.
    const returnUrl = process.env.CLIENT_HOST;

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: checkoutSession.customer,
      return_url: returnUrl,
    });

    res.status(200).json({url: portalSession.url});
  } catch (error) {
    res.status(400).json({message: error.message})
  }
};

