window.source = ""

class AutoPostale {
  constructor() {
    this.url = new URL("http://autopostale.teqmonitoring.com/RTPI-AT/rtpi");
  }

  async listOfBusStops() {
    let result = await this.customFetch("GETTARGETS", {});
    window.source = result.source;

    return result.data.map(i => new BusStop(i));
  }

  stopMonitor() {
    return this.customFetch("STOPMONITOR", {});
  }

  async customFetch(type, data) {
    const getData = () =>
      fetch(this.buildUrl(type, data), {
        method: "GET"
      });

    let result = await getData();

    let _data = await result.json();
    
    if (_data.validity === "KO") {
      result = await getData();
      _data = await result.json();
    }
    return _data;
  }

  queryParams(type, data) {
    return {
      source: window.source,
      destination: 0,
      type,
      data
    };
  }

  buildUrl(type, data) {
    this.url.search = new URLSearchParams({
      data: JSON.stringify(this.queryParams(type, data))
    });
    return this.url;
  }
}

class BusStop extends AutoPostale {
  constructor({ Name, Label, Identifiers }) {
    super();
    this.name = Name;
    this.id = Identifiers.map(i => parseInt(i));
    this.label = Label;
  }

  async listOfBusArriving() {
    let result = await this.customFetch("GETPREDICTIONS", {
      parameters: this.id
    });

    return result.data.map(i => new BusItinerary(i));
  }
}

class BusItinerary extends AutoPostale {
  constructor({ Target, Route, Dir, Routing }) {
    super();
    this.infoBus = {Target, Route, Dir, Routing};
  }

  async itinerary() {
    return this.customFetch("GETROUTING", {
      parameters: this.infoBus.keys()
    });
  }
}

f = new AutoPostale();
g = await f.listOfBusStops()
h = await g[555].listOfBusArriving()
