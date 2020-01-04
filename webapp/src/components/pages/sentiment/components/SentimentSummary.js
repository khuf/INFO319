import React from "react";
import { Paper, Typography } from "@material-ui/core/";
import { PieChart, Pie, Cell, Legend } from "recharts";
import { renderCustomizedLabel } from "./renderFunctions";

const COLORS = ["#82ca9d", "#FF4633", "#FFF333"];

function SentimentSummary(props) {
  const data = [
    { name: "positive", value: props.data.positive },
    { name: "negative", value: props.data.negative },
    { name: "na", value: props.data.na }
  ];
  return (
    <Paper>
      <Typography variant="h6">Total sentiment distribution</Typography>
      <PieChart width={400} height={400}>
        <Pie
          data={data}
          cx={200}
          cy={200}
          labelLine={false}
          label={renderCustomizedLabel}
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Legend />
      </PieChart>
    </Paper>
  );
}

export default SentimentSummary;
