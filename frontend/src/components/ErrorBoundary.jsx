import React from "react";
import { playSound } from "../chaos/ChaosEngine";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
    try {
      playSound("error");
    } catch (e) {
      // ignore
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 text-center">
          <div className="bg-rose-950/40 border border-rose-500/50 p-8 rounded-3xl max-w-lg shadow-[0_0_50px_rgba(244,63,94,0.2)] relative overflow-hidden">
            <h1 className="text-4xl font-black text-rose-500 mb-4 animate-bounce">
              FATAL EMOTIONAL DAMAGE
            </h1>
            <p className="text-slate-300 font-mono text-sm mb-6">
              The application couldn't handle the cringe. We have crashed.
              <br /><br />
              <span className="text-rose-400 text-xs">
                {this.state.error?.toString()}
              </span>
            </p>
            <button
              onClick={() => window.location.reload()}
              className="bg-rose-600 text-white font-black uppercase px-8 py-3 rounded-xl hover:bg-rose-500 transition-colors shadow-lg active:scale-95"
            >
              Restart Simulation
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
