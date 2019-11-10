import React, { Component } from "react";
import NavigationDrawer from "../../../components/NavigationDrawer";
import Paper from "@material-ui/core/Paper";
import Box from "@material-ui/core/Box";
import openSocket from "socket.io-client";
import WordCloud from "./components/WordCloud";
import Moment from "react-moment";
import { HashLoader } from "react-spinners";

import { Grid, InputLabel, Select, MenuItem } from "@material-ui/core/";
import { withStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import {
  TwitterTimelineEmbed,
  /*TwitterShareButton,
  TwitterFollowButton,*/
  TwitterHashtagButton
  /*TwitterMentionButton,
  TwitterTweetEmbed,
  TwitterMomentShare,
  TwitterDMButton,
  TwitterVideoEmbed,
  TwitterOnAirButton*/
} from "react-twitter-embed";

const styles = theme => ({
  content: {
    flexGrow: 1,
    padding: theme.spacing(3)
  },
  paper: {
    padding: theme.spacing(2),
    textAlign: "left",
    color: theme.palette.text.secondary
  }
});

class Dashboard extends Component {
  state = {
    topic: {
      trigrams: {
        batchId: -1,
        window: null,
        threshold: 3,
        loader: true,
        messages: []
      }
    }
  };
  constructor(props) {
    super(props);
    this.socket = openSocket("/", { reconnection: false, forceNew: true });
    /*this.state = {
      topic: {
        trigrams: {
          batchId: -1,
          messages: []
        }
    };*/
  }

  componentDidMount() {
    this.socket.on("connect", function(msg) {
      console.log("Connected to webserver");
    });

    this.socket.on("trigrams", this.handleTrigrams);

    this.socket.on("sentiments", this.handleSentiments);
  }

  handleSentiments = msg => {
    let val = JSON.parse(msg.value);
    console.log(val);
  };
  /**
   * Recapture context of "this" so that we can look for state.
   * A threshold minimum threshold of 2 is set for bigrams to
   * be shown on the wordcloud.
   */
  handleTrigrams = msg => {
    let key = Number(msg.key);
    let value = JSON.parse(msg.value);
    if (key > this.state.topic.trigrams.batchId && value.value > 3) {
      this.setState(prevState => ({
        ...prevState,
        topic: {
          ...prevState.topic,
          trigrams: {
            ...prevState.topic.trigrams,
            batchId: key,
            window: value.window,
            loader: false,
            messages: [value]
          }
        }
      }));
    } else if (key === this.state.topic.trigrams.batchId && value.value > 3) {
      this.setState(prevState => ({
        ...prevState,
        topic: {
          ...prevState.topic,
          trigrams: {
            ...prevState.topic.trigrams,
            messages: [...prevState.topic.trigrams.messages, value]
          }
        }
      }));
    }
  };

  componentWillUnmount() {
    this.socket.disconnect();
  }

  render() {
    const { classes, theme } = this.props;
    const { window, loader, threshold, messages } = this.state.topic.trigrams;

    return (
      <NavigationDrawer>
        <Grid container spacing={3}>
          <Grid container item sm={6} xs={12}>
            <Box width="100%">
              <Paper className={classes.paper}>
                <Typography variant="subtitle2">
                  {"Showing bigrams with threshold " + threshold}
                </Typography>
                <InputLabel id="label">Threshold</InputLabel>
                <Select
                  labelid="label"
                  id="select"
                  value={threshold}
                  onChange={e => {
                    console.log("Update threshold value...");
                  }}
                >
                  <MenuItem value="3">3</MenuItem>
                  <MenuItem value="4">4</MenuItem>
                  <MenuItem value="5">5</MenuItem>
                  <MenuItem value="6">6</MenuItem>
                  <MenuItem value="7">7</MenuItem>
                  <MenuItem value="8">8</MenuItem>
                  <MenuItem value="9">9</MenuItem>
                  <MenuItem value="10">10</MenuItem>
                </Select>
                <HashLoader
                  css="display: block;
                  margin: 0 auto;
                  border-color: red;
                  margin-top: 15%;"
                  sizeUnit={"px"}
                  size={100}
                  color={"#123abc"}
                  loading={loader}
                />
                {window && (
                  <Typography variant="body1">
                    {"Window:\n" + window && (
                      <Moment
                        duration={window.start}
                        date={window.end}
                      ></Moment>
                    )}
                  </Typography>
                )}

                <WordCloud data={messages} />
              </Paper>
            </Box>
          </Grid>
          <Grid container item sm={6} xs={12}>
            <Box width="100%">
              <Paper className={classes.paper}>
                <Typography variant="h6">
                  Tweets fra 2x profiler. En gruppe og en fra 911?
                </Typography>
                <TwitterTimelineEmbed
                  sourceType="profile"
                  screenName="HarveyRelief"
                  options={{ height: 375 }}
                />
                <TwitterTimelineEmbed
                  sourceType="profile"
                  screenName="WaterResearch"
                  options={{ height: 375 }}
                />
              </Paper>
            </Box>
          </Grid>
        </Grid>
      </NavigationDrawer>
    );
  }
}

export default withStyles(styles, { withTheme: true })(Dashboard);
