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
                <Typography variant="h6">World cloud(Venstre side)</Typography>
                <TwitterHashtagButton
                  tag={'HurricaneHarvey'}
                />
                <img src="https://previews.123rf.com/images/radiantskies/radiantskies1210/radiantskies121000282/15997956-abstract-word-cloud-for-emergency-management-with-related-tags-and-terms.jpg" alt="Dis" width="600" height="700">
                </img>
              </Paper>
            </Box>
          </Grid>
          <Grid container item sm={6} xs={12}>
            <Box width="100%">
              <Paper className={classes.paper}>
                <Typography variant="h6">Tweets fra 2x profiler. En gruppe og en fra 911?</Typography>
                <TwitterTimelineEmbed
                  sourceType="profile"
                  screenName="HarveyRelief"
                  options={{height: 375}}
                />
                <TwitterTimelineEmbed
                  sourceType="profile"
                  screenName="WaterResearch"
                  options={{height: 375}}
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
