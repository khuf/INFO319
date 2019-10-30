import React, { Component } from "react";
import { withRouter } from "react-router-dom";
import NavigationDrawer from "../../../components/NavigationDrawer";
import Paper from "@material-ui/core/Paper";
import Box from "@material-ui/core/Box";

import { Grid } from "@material-ui/core/";
import { withStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import { TwitterTimelineEmbed, TwitterShareButton, TwitterFollowButton, TwitterHashtagButton, TwitterMentionButton, TwitterTweetEmbed, TwitterMomentShare, TwitterDMButton, TwitterVideoEmbed, TwitterOnAirButton } from 'react-twitter-embed';


const styles = theme => ({
  content: {
    flexGrow: 1,
    padding: theme.spacing.unit * 3
  },
  paper: {
    padding: theme.spacing.unit * 2,
    textAlign: "center",
    color: theme.palette.text.secondary
  }
});

class Dashboard extends Component {
  state = {};

  constructor(props) {
    super(props);

    this.state = {};
  }

  render() {
    const { classes, theme } = this.props;

    return (
      <NavigationDrawer>
        <Grid container spacing={3}>
          <Grid container item sm={6} xs={12}>
            <Box width="100%">
              <Paper className={classes.paper}>
                <Typography variant="h6">Linke til en bestemt tweet foreløbig</Typography>
                <TwitterHashtagButton
                  tag={'HurricaneHarvey'}
                />
                <TwitterTweetEmbed
                  tweetId={'1187411731015962626'}
                />
              </Paper>
            </Box>
          </Grid>
          <Grid container item sm={6} xs={12}>
            <Box width="100%">
              <Paper className={classes.paper}>
                <Typography variant="h6">Tweets fra profil, tenker etter # med data?</Typography>
                <TwitterTimelineEmbed
                  sourceType="profile"
                  screenName="HarveyRelief"
                  options={{height: 675}}
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
