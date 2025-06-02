class TripCreationWebSocket {
  constructor() {
    this.ws = null;
    this.onProgress = null;
    this.onSuccess = null;
    this.onError = null;
    this.onConnection = null;
  }

  connect(baseURL = "") {
    return new Promise((resolve, reject) => {
      try {
        const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
        const host = baseURL || window.location.host;
        const wsUrl = `${protocol}//${host}/api/v1/trip-management/ws/trip-creation`;

        this.ws = new WebSocket(wsUrl);

        this.ws.onopen = () => {
           ;
          resolve();
        };

        this.ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            this.handleMessage(data);
          } catch (error) {
             ;
          }
        };

        this.ws.onerror = (error) => {
           ;
          if (this.onError) {
            this.onError("Connection error");
          }
          reject(error);
        };

        this.ws.onclose = (event) => {
           ;
          if (event.code !== 1000 && this.onError) {
            this.onError("Connection closed unexpectedly");
          }
        };
      } catch (error) {
         ;
        reject(error);
      }
    });
  }

  handleMessage(data) {
    const { type, message, progress, trip_id, data: responseData } = data;

    switch (type) {
      case "connection":
        if (this.onConnection) {
          this.onConnection(message, progress);
        }
        break;
      case "progress":
        if (this.onProgress) {
          this.onProgress(message, progress, trip_id);
        }
        break;
      case "success":
        if (this.onSuccess) {
          this.onSuccess(message, responseData, trip_id);
        }
        this.disconnect();
        break;
      case "error":
        if (this.onError) {
          this.onError(message, progress);
        }
        this.disconnect();
        break;
      default:
        console.warn("Unknown message type:", type);
    }
  }

  sendTripData(formData) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(formData));
    } else {
      throw new Error("WebSocket is not connected");
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close(1000, "Normal closure");
      this.ws = null;
    }
  }

  setEventHandlers({ onConnection, onProgress, onSuccess, onError }) {
    this.onConnection = onConnection;
    this.onProgress = onProgress;
    this.onSuccess = onSuccess;
    this.onError = onError;
  }

  isConnected() {
    return this.ws && this.ws.readyState === WebSocket.OPEN;
  }
}

export default TripCreationWebSocket;
