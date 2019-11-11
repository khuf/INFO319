import React, { Component } from "react";
import NavigationDrawer from "../../../components/NavigationDrawer";
import Paper from "@material-ui/core/Paper";
import Box from "@material-ui/core/Box";
import openSocket from "socket.io-client";
import Moment from "react-moment";
import { HashLoader } from "react-spinners";

import { Grid, InputLabel, Select, MenuItem } from "@material-ui/core/";
import { withStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";

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

class SentimentPage extends Component {
  state = {
    topic: {
      sentiments: {
        batchId: -1,
        window: null,
        loader: true,
        messages: [
          {
            "text": "Se mantiene alerta por posible paso de tormenta tropical #Harvey @MagdalenaDCC @GestionRiesgoSM @CruzRojaMag @UNGRD @EKALVARADO18 @jgesquea https://t.co/J0XwFrCxgf",
            "result": [
              "negative"
            ],
            "metadata": [
              {
                "confidence": "1.0"
              }
            ],
            "combinedResult": [
              {
                "0": "negative",
                "1": {
                  "confidence": "1.0"
                }
              }
            ]
          },
          {
            "text": "Current view of #Harvey as it propagates into the central Caribbean. Also, check out that large disturbance north of Cuba! https://t.co/LM5qCAZF6T",
            "result": [
              "positive",
              "positive",
              "na"
            ],
            "metadata": [
              {
                "confidence": "0.5335"
              },
              {
                "confidence": "0.4654"
              },
              {
                "confidence": "0.0"
              }
            ],
            "combinedResult": [
              {
                "0": "positive",
                "1": {
                  "confidence": "0.5335"
                }
              },
              {
                "0": "positive",
                "1": {
                  "confidence": "0.4654"
                }
              },
              {
                "0": "na",
                "1": {
                  "confidence": "0.0"
                }
              }
            ]
          },
          {
            "text": "Hier soir le ciel inspirait certains...  ⚡️ #Martinique #Harvey\n\n📷 IG : okazoumwenla https://t.co/sCXEf0Tmlu",
            "result": [
              "negative",
              "negative",
              "negative",
              "negative"
            ],
            "metadata": [
              {
                "confidence": "0.5164"
              },
              {
                "confidence": "0.5140"
              },
              {
                "confidence": "0.5140"
              },
              {
                "confidence": "0.8426"
              }
            ],
            "combinedResult": [
              {
                "0": "negative",
                "1": {
                  "confidence": "0.5164"
                }
              },
              {
                "0": "negative",
                "1": {
                  "confidence": "0.5140"
                }
              },
              {
                "0": "negative",
                "1": {
                  "confidence": "0.5140"
                }
              },
              {
                "0": "negative",
                "1": {
                  "confidence": "0.8426"
                }
              }
            ]
          },
          {
            "text": "RT @galindojorgemij: #Harvey \n#ProteccionCivil : Se mantiene la prohibición de zarpe para embarcaciones menores en los estados: Sucre, Anzo…",
            "result": [
              "negative"
            ],
            "metadata": [
              {
                "confidence": "0.6880"
              }
            ],
            "combinedResult": [
              {
                "0": "negative",
                "1": {
                  "confidence": "0.6880"
                }
              }
            ]
          },
          {
            "text": "RT @YvanDelPsuv: Gobierno Bolivariano activa a más de 7.750 funcionarios ante tormenta #Harvey que pasará por las costas venezolanas #18Ago…",
            "result": [
              "negative"
            ],
            "metadata": [
              {
                "confidence": "0.5363"
              }
            ],
            "combinedResult": [
              {
                "0": "negative",
                "1": {
                  "confidence": "0.5363"
                }
              }
            ]
          }
        ]
      }
    }
  };
  constructor(props) {
    super(props);
    this.socket = openSocket("/", { reconnection: false, forceNew: true });
  }

  componentDidMount() {
    this.socket.on("connect", function(msg) {
      console.log("Connected to webserver");
    });

    this.socket.on("sentiments", this.handleSentiments);
  }

  /**
   * Recapture context of "this" so that we can look for state.
   */
  handleSentiments = msg => {
    const { batchId } = this.state.topic.sentiments;
    let key = Number(msg.key);
    console.log(this.state);
    let value = JSON.parse(msg.value);
    if (key > batchId) {
      this.setState(prevState => ({
        ...prevState,
        topic: {
          ...prevState.topic,
          sentiments: {
            ...prevState.topic.sentiments,
            batchId: key,
            loader: false,
            messages: [value]
          }
        }
      }));
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
  };

  componentWillUnmount() {
    this.socket.disconnect();
  }

  render() {
    const { classes, theme } = this.props;
    const { window, loader, threshold, messages } = this.state.topic.sentiments;

    return (
      <NavigationDrawer>
        <Grid container spacing={3}>
          <Grid container item sm={12} xs={12}>
            <Box width="100%">
              <Paper className={classes.paper}></Paper>
            </Box>
          </Grid>
        </Grid>
      </NavigationDrawer>
    );
  }
}

export default withStyles(styles, { withTheme: true })(SentimentPage);
