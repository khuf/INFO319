import React, { PureComponent } from "react";
import { Typography } from "@material-ui/core";

export default class TweetInfo extends PureComponent {
  render() {
    const { info } = this.props;
    const displayName = `"${info.full_text}", ${info.user.screen_name}`;
    const url = `https://twitter.com/statuses/${info.id_str}`;
    const coordinates = info.geo.coordinates;

    return (
      <div>
        <Typography variant="body2">
          <strong>Tweet:</strong> {displayName}
        </Typography>
        <Typography variant="body2" align="center">
          <strong>Link:</strong> {url}
        </Typography>
        <Typography variant="body2" align="center">
          <strong>Coordinates:</strong> {coordinates}
        </Typography>
      </div>
    );
  }
}
