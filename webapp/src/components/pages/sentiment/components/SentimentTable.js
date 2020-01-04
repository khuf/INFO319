import React from "react";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import Typography from "@material-ui/core/Typography";
import Link from "@material-ui/core/Link";
import SentimentSatisfiedAltIcon from "@material-ui/icons/SentimentSatisfiedAlt";
import SentimentVeryDissatisfiedIcon from "@material-ui/icons/SentimentVeryDissatisfied";
import { Tooltip as MaterialTooltip } from "@material-ui/core/";
import Paper from "@material-ui/core/Paper";

function SentimentTable(props) {
  const data = props.data;

  return (
    <Paper>
      <Table aria-label="simple table">
        <TableHead>
          <TableRow>
            <TableCell>Sentence</TableCell>
            <TableCell align="right">Sentiment</TableCell>
            <TableCell align="right">Confidence level</TableCell>
            <TableCell align="right">Link</TableCell>
            <TableCell align="right">Tweet ID</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((tweet, id) =>
            tweet.combinedResult.map((sentence, index) => {
             if (sentence[0].length > 15) { return <TableRow key={index}>
                <TableCell component="th" scope="row">
                  <MaterialTooltip title={tweet.text}>
                    <Typography
                      variant="body2"
                      dangerouslySetInnerHTML={{
                        __html: sentence["0"]
                      }}
                    ></Typography>
                  </MaterialTooltip>
                </TableCell>
                <TableCell align="right">
                  {sentence["1"] === "negative" ? (
                    <SentimentVeryDissatisfiedIcon style={{ color: "red" }} />
                  ) : (
                    <SentimentSatisfiedAltIcon style={{ color: "green" }} />
                  )}
                </TableCell>
                <TableCell align="right">
                  {sentence["2"]["confidence"].toString()}
                </TableCell>
                <TableCell align="right">
                  <Link
                    href={"https://twitter.com/statuses/" + tweet.id_str}
                    onClick={event => event.preventDefault()}
                    variant="body2"
                  >
                    Link
                  </Link>
                </TableCell>
                <TableCell align="right">{id}</TableCell>
              </TableRow>
	     }
	    })
          )}
        </TableBody>
      </Table>
    </Paper>
  );
}

export default SentimentTable;
