import React from "react";
import { Paper, Typography } from "@material-ui/core/";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";
import { renderTooltip } from "./renderFunctions";

function SentimentLineChart(props) {
  return (
    <Paper>
      <Typography variant="h6">Sentiment distribution per batch</Typography>
      <ResponsiveContainer width="95%" height={250}>
        <LineChart
          width={980}
          height={250}
          data={props.data}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="batchId" />
          <YAxis />
          <Tooltip content={renderTooltip} />
          <Legend />
          <Line type="monotone" dataKey="positive" stroke="#82ca9d" />
          <Line type="monotone" dataKey="negative" stroke="#FF4633" />
          <Line type="monotone" dataKey="na" stroke="#FFF333" />
        </LineChart>
      </ResponsiveContainer>
    </Paper>
  );
}

export default SentimentLineChart;
