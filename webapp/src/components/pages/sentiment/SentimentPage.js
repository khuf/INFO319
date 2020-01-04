import React, { Component } from "react";
import NavigationDrawer from "../../NavigationDrawer";
//import data from "../../../data/sentiments.json";
import Box from "@material-ui/core/Box";
import openSocket from "socket.io-client";
import update from "immutability-helper";
import SentimentSummary from "./components/SentimentSummary";
import SentimentBarChart from "./components/SentimentBarChart";
import SentimentLineChart from "./components/SentimentLineChart";
import SentimentTable from "./components/SentimentTable";

import { Grid } from "@material-ui/core/";
import { withStyles } from "@material-ui/core/styles";

const styles = theme => ({
  content: {
    flexGrow: 1,
    padding: theme.spacing(3)
  },
  paper: {
    padding: theme.spacing(2),
    textAlign: "left"
  },
  positiveIcon: {
    color: "green"
  },
  negativeIcon: {
    color: "red"
  }
});

/**
 * Sentiment analysis page
 * Displays a table of sentiments and three charts - pie chart, bar chart, and line chart
 */
class SentimentPage extends Component {
  state = {
    topic: {
      sentiments: {
        batchId: -1,
        window: null,
        timestamp: "",
        loader: true,
        messages: []
      }
    },
    batches: {},
    count: 0,
    summary: {
      positive: 0,
      negative: 0,
      na: 0
    }
  };

  constructor(props) {
    super(props);
    this.socket = openSocket("/", { reconnection: false, forceNew: true });
  }

  /**
   *  Start listenening to sockets for incoming messages
   */
  componentDidMount() {
    this.socket.on("connect", function(msg) {
      console.log("Connected to webserver");
    });

    this.socket.on("sentiments", this.handleSentiments);

    /**
     * If errors are not handled, application will crash
     * Running the react application on a mobile phone would sometimes
     * cause the app to crash.
     * ToDo: Find out the underlying problem.
     */
    this.socket.on("error", err => {
      console.log(err);
    });
  }

  /**
   * Update batch summary used for pie charts
   */
  updateBatchSummary = (batchId, timestamp) => {
    //Retrieve the newly added element
    const lastMessage = this.state.topic.sentiments.messages.slice(-1).pop();

    // Clear array whenever batch count exceeds 25
    if (this.state.count >= 25) {
      this.setState({ count: 0, batches: {} });
    }

    // Update state
    if (lastMessage !== undefined && batchId > 0) {
      //Update existing batch with element
      this.incrementBatchWithId(
        batchId,
        timestamp,
        lastMessage.combinedResult[0]["1"]
      );

      //Retrieves sentiment value of last message, i.e. "positive", "negative", or "na"
      let sentiment = lastMessage.combinedResult[0]["1"];

      //Increment sentiment value (used for piecharts)
      this.setState(prevState => ({
        summary: {
          ...prevState.summary,
          [sentiment]: prevState.summary[sentiment] + 1
        }
      }));
    }
  };

  //Increment batch with a specified id, i.e. update its negative, positive, or neutral value
  incrementBatchWithId(batchId, timestamp, key) {
    if (this.state.batches.hasOwnProperty(batchId) && batchId >= 0) {
      this.setState(prevState => ({
        batches: update(this.state.batches, {
          [batchId]: { [key]: { $apply: curr => curr + 1 } }
        })
      }));
    } else {
      let val = {
        [batchId]: {
          batchId: batchId,
          timestamp: timestamp,
          positive: 0,
          negative: 0,
          na: 0
        }
      };

      val[batchId][key] = val[batchId][key] + 1;

      this.setState(prevState => ({
        ...prevState,
        batches: { ...prevState.batches, ...val }
      }));
    }
  }
  /**
   * Recapture context of "this" so that we can look for state.
   */
  handleSentiments = msg => {
    // Retrieve batch and messages from state
    const { batchId, timestamp } = this.state.topic.sentiments;
    const { messages } = this.state.topic.sentiments;

    //Parse key from string to number
    let key = Number(msg.key);

    //Parse string value as json
    let value = JSON.parse(msg.value);
    console.log(this.state);

     //Clear sentiment values (used in table)
    //setState not called before going out of scope
    if (messages.length >= 30) {
      const newState = {
        ...this.state.topic,
        sentiments: {
          ...this.state.topic.sentiments,
          messages: []
        }
      };
      this.setState({ topic: newState });
    }


    //If incoming batch is newer, replace the existing one
    if (key > batchId) {
      this.setState(prevState => ({
        ...prevState,
        topic: {
          ...prevState.topic,
          sentiments: {
            ...prevState.topic.sentiments,
            batchId: key,
            timestamp: value.timestamp,
            loader: false,
            messages: [value]
          }
        }
      }));

      this.setState({ count: this.state.count + 1 });

      //Incoming message belongs to existing batch --> add it
    } else if (key === batchId) {
      this.setState(prevState => ({
        ...prevState,
        topic: {
          ...prevState.topic,
          sentiments: {
            ...prevState.topic.sentiments,
            messages: [...prevState.topic.sentiments.messages, value]
          }
        }
      }));
    }

    this.updateBatchSummary(batchId, timestamp);
  };

  //Disconnect from websockets upon refresh/unmount from DOM
  componentWillUnmount() {
    this.socket.disconnect();
  }

  render() {
    return (
      <NavigationDrawer>
        <Grid container spacing={3}>
          <Grid container item xs={12} sm={12}>
            <Box width="100%">
              <SentimentLineChart data={Object.values(this.state.batches)} />
            </Box>
          </Grid>
          <Grid container item sm={12} xs={12}>
            <Box width="50%">
              <SentimentSummary data={this.state.summary} />
            </Box>
            <Box width="50%">
              <SentimentBarChart data={Object.values(this.state.batches)} />
            </Box>
          </Grid>
          <Grid container item sm={12} xs={12}>
            <Box width="100%">
              <SentimentTable data={this.state.topic.sentiments.messages} />
            </Box>
          </Grid>
        </Grid>
      </NavigationDrawer>
    );
  }
}

export default withStyles(styles, { withTheme: true })(SentimentPage);
