import React, { Component } from "react";
import { withRouter } from "react-router-dom";
import NavigationDrawer from "../../../components/NavigationDrawer";
import Box from "@material-ui/core/Box";
import GoogleMapReact from "google-map-react";
import { Grid } from "@material-ui/core/";

const AnyReactComponent = ({ text }) => <div>{text}</div>;

class CrisisMap extends Component {
  static defaultProps = {
    center: {
      lat: 59.95,
      lng: 30.33
    },
    zoom: 11
  };

  render() {
    return (
      <NavigationDrawer>
        <Grid container spacing={3}>
          <Box width="100%">
            <div style={{ height: "100vh", width: "100%" }}>
              <GoogleMapReact
                bootstrapURLKeys={{
                  key: process.env.REACT_APP_GOOGLE_MAPS_API_KEY
                }}
                defaultCenter={this.props.center}
                defaultZoom={this.props.zoom}
              >
                {console.log(process.env.REACT_APP_GOOGLE_MAPS_API_KEY)}
                <AnyReactComponent
                  lat={59.955413}
                  lng={30.337844}
                  text="My Marker"
                />
              </GoogleMapReact>
            </div>
          </Box>
        </Grid>
      </NavigationDrawer>
    );
  }
}

export default withRouter(CrisisMap);
