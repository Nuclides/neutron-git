var React = require('react/addons');
var _ = require('underscore');
var EventEmitter = require('events').EventEmitter;
var ee = new EventEmitter;

var HistoryList = React.createClass({
  render: function() {
    var createItem = function(item) {
      return (
        <HistoryItem key={item.sha} commit={item} />
      );
    };
    return <ul>{this.props.items.map(createItem)}</ul>;
  }
});

var HistoryItem = React.createClass({
  getInitialState: function() {
    return {selected: false};
  },
  handleClick: function(event) {
    ee.emit('list-select-change', {sha: this.props.commit.sha});
  },
  selectedCommitChanged: function(e) {
    if (e.sha === this.props.commit.sha) {
      this.setState({selected: true});
    }
    else {
      this.setState({selected: false});
    }
  },
  componentDidMount: function(event) {
    ee.on('list-select-change', this.selectedCommitChanged);
  },
  componentWillUnmount: function(event) {
    ee.removeListener('list-select-change', this.selectedCommitChanged);
  },
  render: function() {
    var cx = React.addons.classSet;
    var classes = cx({
      'clearfix': true,
      'selected': this.state.selected
    });
    return (
      <li className="clearfix" className={classes} onClick={this.handleClick}>
        <p className="message">{this.props.commit.message}</p>
        <p className="sha">{this.props.commit.sha}</p>
        <p className="author">{this.props.commit.author}</p>
        <p className="date">{this.props.commit.date}</p>
      </li>
    );
  }
});

var CommitViewer = React.createClass({
  render: function() {
    if (_.isEmpty(this.props.commit)) {
      return <div id="current-commit"></div>;
    }
    else {
      return (
        <div id="current-commit">
          <p className="message">{this.props.commit.message}</p>
          <p className="sha">{this.props.commit.sha}</p>
          <p className="author">{this.props.commit.author}</p>
          <p className="date">{this.props.commit.date}</p>
        </div>
      );
    }
  }
});

var App = React.createClass({
  getInitialState: function() {
    return {repo: '', history: [], currentCommit: {}};
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
            sha:     commit.sha().substring(0, 8),
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
      <div id="app" className="clearfix">
        <div id="sidebar">
          <form onSubmit={this.handleSubmit}>
            <input onChange={this.onChange} value={this.state.repo} />
            <button>Refresh</button>
          </form>
          <HistoryList items={this.state.history} />
        </div>
        <div id="content">
          <CommitViewer commit={this.state.currentCommit} />
        </div>
      </div>
    );
  }
});

React.render(<App />, document.body);
