import React from "react";
import { Paper, Typography } from "@material-ui/core/";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  ResponsiveContainer
} from "recharts";

function SentimentBarChart(props) {
  return (
    <Paper>
      <Typography variant="h6">Sentriment distribution per batch</Typography>
      <ResponsiveContainer width="95%" height={400}>
        <BarChart
          data={props.data}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="batchId" />
          <YAxis
            type="number"
            domain={[dataMin => 0 - Math.abs(dataMin), dataMax => dataMax * 2]}
          />
          <Tooltip />
          <Legend />
          <ReferenceLine y={0} stroke="#000" />
          <Bar name="positive" dataKey="positive" fill="#82ca9d" />
          <Bar name="negative" dataKey={x => x.negative * -1} fill="#FF4633" />
        </BarChart>
      </ResponsiveContainer>
    </Paper>
  );
}

export default SentimentBarChart;
