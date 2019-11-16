import React, { Component } from "react";
import NavigationDrawer from "../../../components/NavigationDrawer";
import data from "../../../data/sentiments.json";
import Paper from "@material-ui/core/Paper";
import Box from "@material-ui/core/Box";
import openSocket from "socket.io-client";
import Moment from "react-moment";
import { HashLoader } from "react-spinners";
import { makeStyles } from "@material-ui/core/styles";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import SentimentSatisfiedAltIcon from "@material-ui/icons/SentimentSatisfiedAlt";
import SentimentVeryDissatisfiedIcon from "@material-ui/icons/SentimentVeryDissatisfied";

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
        messages: data
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

    const useStyles = makeStyles({
      root: {
        width: "100%",
        overflowX: "auto"
      },
      table: {
        minWidth: 650
      }
    });

    function createData(name, sentiment, cf, id) {
      return { name, sentiment, cf, id };
    }

    const rows = [
      createData(
        "Gobierno Bolivariano activa a más de 7.750 funcionarios ante tormenta",
        ":)",
        4.0,
        "twitter.com"
      ),
      createData(
        "Gobierno Bolivariano activa a más",
        "SentimentSatisfiedAltIcon",
        10.0,
        "twitter.com"
      ),
      createData(
        "De 7.750 funcionarios ante tormenta",
        "SentimentVeryDissatisfiedIcon",
        1.0,
        "twitter.com"
      ),
      createData("ante tormenta", ":(", 14, "twitter.com")
    ];

    return (
      <NavigationDrawer>
        <Grid container spacing={3}>
          <Grid container item sm={12} xs={12}>
            <Box width="100%">
              <Paper className={classes.paper}></Paper>
              <Paper className={classes.root}>
                <Table className={classes.table} aria-label="simple table">
                  <TableHead>
                    <TableRow>
                      <TableCell>Sentence</TableCell>
                      <TableCell align="right">Sentiment</TableCell>
                      <TableCell align="right">Confidence level</TableCell>
                      <TableCell align="right">Twitter ID</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {rows.map(row => (
                      <TableRow key={row.name}>
                        <TableCell component="th" scope="row">
                          {row.name}
                        </TableCell>
                        <TableCell align="right">{row.sentiment}</TableCell>
                        <TableCell align="right">{row.cf}</TableCell>
                        <TableCell align="right">{row.id}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Paper>
            </Box>
          </Grid>
        </Grid>
      </NavigationDrawer>
    );
  }
}

export default withStyles(styles, { withTheme: true })(SentimentPage);
