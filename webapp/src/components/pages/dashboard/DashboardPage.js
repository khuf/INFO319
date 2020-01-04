import React, { PureComponent } from "react";
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
import { TwitterTimelineEmbed } from "react-twitter-embed";

const styles = theme => ({
  content: {
    flexGrow: 1,
    padding: theme.spacing(3)
  },
  paper: {
    padding: theme.spacing(2),
    textAlign: "left"
  }
});

class Dashboard extends PureComponent {
  state = {
    topic: {
      bigrams: {
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
  }

  /**
   *  Start listenening to sockets for incoming messages
   */
  componentDidMount() {
    this.socket.on("connect", function(msg) {
      console.log("Connected to webserver");
    });

    this.socket.on("bigrams", this.handleBigrams);
  }

  /**
   * Recapture context of "this" so that we can look for state.
   * A threshold minimum threshold of 2 is set for bigrams to
   * be shown on the wordcloud.
   */
  handleBigrams = msg => {
    let key = Number(msg.key);
    let value = JSON.parse(msg.value);

    //If incoming messages comes from a newer batch, replace messages
    if (key > this.state.topic.bigrams.batchId && value.value > 2) {
      this.setState(prevState => ({
        ...prevState,
        topic: {
          ...prevState.topic,
          bigrams: {
            ...prevState.topic.bigrams,
            batchId: key,
            window: value.window,
            loader: false,
            messages: [value]
          }
        }
      }));
      //If incoming messages belongs to existing batch --> add it
    } else if (key === this.state.topic.bigrams.batchId && value.value > 2) {
      this.setState(prevState => ({
        ...prevState,
        topic: {
          ...prevState.topic,
          bigrams: {
            ...prevState.topic.bigrams,
            messages: [...prevState.topic.bigrams.messages, value]
          }
        }
      }));
    }
  };

  //Disconnect from sockets when dismounting DOM
  componentWillUnmount() {
    this.socket.disconnect();
  }

  render() {
    const { classes, theme } = this.props;
    const { window, loader, threshold, messages } = this.state.topic.bigrams;

    return (
      <NavigationDrawer>
        <Grid container spacing={3}>
          <Grid container item sm={12} xs={12}>
            <Box width="100%">
              <Paper className={(classes.paper, theme.paper)}>
                <Typography variant="h6">
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
                      <>
                        <Moment format="YYYY/MM/DD HH:mm">
                          {window.start}
                        </Moment>
                        {" - "}
                        <Moment format="YYYY/MM/DD HH:mm">{window.end}</Moment>
                      </>
                    )}
                  </Typography>
                )}

                <WordCloud
                  batchId={this.state.topic.bigrams.batchId}
                  data={messages}
                />
              </Paper>
            </Box>
          </Grid>
          <Grid container item sm={12} xs={12}>
            <Box width="100%">
              <Paper className={classes.paper}>
                <TwitterTimelineEmbed
                  sourceType="profile"
                  screenName="HarveyRelief"
                  options={{ height: 1000 }}
                />
                <TwitterTimelineEmbed
                  sourceType="profile"
                  screenName="TxStateUPD"
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
