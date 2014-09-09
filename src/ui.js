/** @jsx React.DOM */
var React = require('react');

var HistoryList = React.createClass({
  render: function() {
    var createItem = function(item) {
      return (
        <li className="clearfix">
          <p className="message">{item.message}</p>
          <p className="sha">{item.sha}</p>
          <p className="author">{item.author}</p>
          <p className="date">{item.date}</p>
        </li>
      );
    };
    return <ul>{this.props.items.map(createItem)}</ul>;
  }
});

var App = React.createClass({
  getInitialState: function() {
    return {repo: '', history: []};
  },
  onChange: function(e) {
    this.setState({repo: e.target.value});
  },
  handleSubmit: function(e) {
    e.preventDefault();

    var open = require("nodegit").Repo.open;
    var app = this;
    open(this.state.repo, function(err, repo) {
      if (err) {
        throw err;
      }

      repo.getMaster(function(err, branch) {
        if (err) {
          throw err;
        }

        var history = branch.history();
        var historyList = [];

        history.on("commit", function(commit) {
          historyList.push({
            sha:     commit.sha().substring(0, 11),
            author:  commit.author().name(),
            email:   commit.author().email(),
            message: commit.message(),
            date:    commit.date()
          });

          app.setState({history: historyList});
        });

        history.start();
      });
    });
  },
  render: function() {
    return (
      <div id="sidebar">
        <form onSubmit={this.handleSubmit}>
          <input onChange={this.onChange} value={this.state.repo} />
          <button>Refresh</button>
        </form>
        <HistoryList items={this.state.history} />
      </div>
    );
  }
});

React.renderComponent(<App />, document.getElementById('main'));
