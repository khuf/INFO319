import React, { Component } from "react";
import ReactWordcloud from "react-wordcloud";

class WordCloud extends Component {
  constructor(props) {
    super(props);
  }
  /*shouldComponentUpdate(nextProps, nextState) {
    console.log(nextProps.data.length);
    return nextProps.data.length % 25 == 0;
  }*/
  render() {
    return (
      <div>
        <ReactWordcloud words={this.props.data}></ReactWordcloud>
      </div>
    );
  }
}

export default WordCloud;
