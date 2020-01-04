import React, { Component } from "react";
import { withRouter } from "react-router-dom";
import NavigationDrawer from "../../../components/NavigationDrawer";
import Box from "@material-ui/core/Box";
import { Grid } from "@material-ui/core/";
import RoomIcon from "@material-ui/icons/Room";
import IconButton from "@material-ui/core/IconButton";
import geotweets from "../../../data/geotweets.json";
import TweetInfo from "./components/TweetInfo";
import MapGL, {
  Marker,
  Popup,
  NavigationControl,
  FullscreenControl
} from "react-map-gl";

const navStyle = {
  position: "absolute",
  top: 36,
  left: 0,
  padding: "10px"
};

const fullscreenControlStyle = {
  position: "absolute",
  top: 0,
  left: 0,
  padding: "10px"
};

class CrisisMap extends Component {
  static defaultProps = {
    center: {
      lat: 29.53,
      lng: -95.29
    },
    zoom: 5
  };

  state = {
    viewport: {
      latitude: 37.785164,
      longitude: -100,
      zoom: 3.5,
      bearing: 0,
      pitch: 0
    },
    geotweets: geotweets
  };

  _updateViewport = viewport => {
    this.setState({ viewport });
  };

  _renderTweetMarker = (tweet, index) => {
    return (
      <Marker
        key={`marker-${index}`}
        longitude={tweet.coordinates.coordinates[0]}
        latitude={tweet.coordinates.coordinates[1]}
      >
        <IconButton onClick={() => this.setState({ popupInfo: tweet })}>
          <RoomIcon color="error" />
        </IconButton>
      </Marker>
    );
  };

  _renderPopup() {
    const { popupInfo } = this.state;

    return (
      popupInfo && (
        <Popup
          tipSize={5}
          anchor="top"
          longitude={popupInfo.coordinates.coordinates[0]}
          latitude={popupInfo.coordinates.coordinates[1]}
          closeOnClick={false}
          onClose={() => this.setState({ popupInfo: null })}
        >
          <TweetInfo info={popupInfo} />
        </Popup>
      )
    );
  }

  render() {
    const { viewport, geotweets } = this.state;
    return (
      <NavigationDrawer>
        <Grid container spacing={3}>
          <Box width="100%">
            <div style={{ height: "100vh", width: "100%" }}>
              <MapGL
                {...viewport}
                width="100%"
                height="100%"
                mapStyle="mapbox://styles/mapbox/dark-v9"
                onViewportChange={this._updateViewport}
                mapboxApiAccessToken={process.env.REACT_APP_MAPBOX_API_KEY}
              >
                {geotweets.map(this._renderTweetMarker)}

                {this._renderPopup()}

                <div className="fullscreen" style={fullscreenControlStyle}>
                  <FullscreenControl />
                </div>
                <div className="nav" style={navStyle}>
                  <NavigationControl />
                </div>
              </MapGL>
            </div>
          </Box>
        </Grid>
      </NavigationDrawer>
    );
  }
}

export default withRouter(CrisisMap);
