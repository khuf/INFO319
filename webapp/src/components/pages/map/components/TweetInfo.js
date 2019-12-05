import React, { PureComponent } from "react";
import Link from "@material-ui/core/Link";

export default class TweetInfo extends PureComponent {
  render() {
    const { info } = this.props;
    const displayName = `"${info.full_text}", ${info.user.screen_name}`;
    const url = `https://twitter.com/statuses/${info.id_str}`;
    const coordinates = info.geo.coordinates;

    return (
      <div>
        <ul>
          <li>Tweet: {displayName}</li>
          <li>
            URL:
            <Link variant="body2">{url}</Link>
          </li>
          <li>Coordinates: {coordinates}</li>
        </ul>
      </div>
    );
  }
}
