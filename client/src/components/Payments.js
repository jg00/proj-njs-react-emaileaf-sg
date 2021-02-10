import React, { Component } from "react";
import StripeCheckout from "react-stripe-checkout";
import { connect } from "react-redux";
import * as actions from "../actions";

class Payments extends Component {
  render() {
    return (
      <StripeCheckout
        name="Emaileaf"
        description="$5 for 5 email credits"
        amount={500}
        token={(token) => this.props.handleToken(token)}
        stripeKey={process.env.REACT_APP_STRIPE_KEY}
      >
        <button className="btn-small">Add Credits</button>
      </StripeCheckout>
    );
  }
}

export default connect(null, actions)(Payments);

/*
  // Ref only 
  class Payments extends Component {
    render() {
      return (
        <StripeCheckout
          name="Emaileaf"
          description="$5 for 5 email credits"
          amount={500}
          token={(token) => console.log(token)}   // callback called after receiving token representing authorizing a charge
          stripeKey={process.env.REACT_APP_STRIPE_KEY}
        >
          <button className="btn-small">Add Credits</button>
        </StripeCheckout>
      );
    }
  }
  
*/
