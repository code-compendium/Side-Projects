import { Component } from "react";

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught:", error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <h2>Er ging iets mis</h2>
          <p>{this.state.error?.message || "Onbekende fout"}</p>
          <button onClick={this.handleRetry} className="retry-button">
            Probeer opnieuw
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
