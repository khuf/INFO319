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
      lat: 29.53,
      lng: -95.29
    },
    zoom: 5
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
                  lat={29.533220}
                  lng={-95.294176}
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
