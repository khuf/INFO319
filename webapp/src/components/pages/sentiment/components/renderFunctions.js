import React from "react";
import Moment from "react-moment";
import DefaultTooltipContent from "recharts/lib/component/DefaultTooltipContent";

const RADIAN = Math.PI / 180;

export const renderCustomizedLabel = ({
  cx,
  cy,
  midAngle,
  innerRadius,
  outerRadius,
  percent,
  index
}) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text
      x={x}
      y={y}
      fill="white"
      textAnchor={x > cx ? "start" : "end"}
      dominantBaseline="central"
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

export const renderTooltip = props => {
  if (!props.active || props.payload == null) {
    return null;
  }

  const newPayload = [
    {
      name: "Batch id",
      value: props.payload[0].payload.batchId
    },
    {
      name: "Timestamp",
      value: (
        <Moment format="HH:mm:ss">{props.payload[0].payload.timestamp}</Moment>
      )
    },
    ...props.payload
  ];
  console.log(props.payload);

  // we render the default, but with our overridden payload
  return <DefaultTooltipContent {...props} payload={newPayload} />;
};
