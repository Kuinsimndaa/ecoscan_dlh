import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    // Log error for debugging
    console.error('Uncaught error:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center p-6">
            <h2 className="text-xl font-bold">Terjadi Kesalahan</h2>
            <p className="mt-2 text-sm text-gray-600">Silahkan muat ulang halaman atau hubungi administrator.</p>
            <button
              className="mt-4 px-4 py-2 bg-green-600 text-white rounded"
              onClick={() => window.location.reload()}
            >
              Muat Ulang
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
