import React from "react";
import ReactWordcloud from "react-wordcloud";

function WordCloud(props) {
  return (
    <div>
      <ReactWordcloud words={props.data}></ReactWordcloud>
    </div>
  );
}

export default WordCloud;
