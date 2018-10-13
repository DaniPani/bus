let url = new URL("http://autopostale.teqmonitoring.com/RTPI-AT/rtpi");
let source = "";

const getListOfBusStops = async () => {
  let queryParams = {
    source,
    destination: 0,
    type: "GETTARGETS"
  };
  url.search = new URLSearchParams({
    data: JSON.stringify(queryParams)
  });

  let result = await fetch(url, {
    method: "GET"
  });

  return result.json();
};

const getPredictions = async idBusStop => {
  let busStopSelected = listOfStops[idBusStop];
  let idBusArriving = busStopSelected.Identifiers.map(i => parseInt(i.id));

  let queryParams = {
    source,
    destination: 0,
    type: "GETPREDICTIONS",
    data: {
      parameters: idBusArriving
    }
  };

  url.search = new URLSearchParams({
    data: JSON.stringify(queryParams)
  });

  let result = await fetch(url, {
    method: "GET"
  });

  return result.json();
};

const findFromCode = codeSelected => {
  debugger;
  return listOfStops.findIndex(({ Identifiers }) => {
    Identifiers.forEach(({ code }) => code == codeSelected);
  });
};

const getItinerary = async idItinerary => {
  let busInfoSelected = ItinerariesList[idItinerary];
  let infoBus = [
    busInfoSelected.targetUID,
    busInfoSelected.routeUID,
    busInfoSelected.direction,
    busInfoSelected.routingUID
  ];

  let queryParams = {
    source,
    destination: 0,
    type: "GETROUTING",
    data: {
      parameters: infoBus
    }
  };

  url.search = new URLSearchParams({
    data: JSON.stringify(queryParams)
  });

  let result = await fetch(url, {
    method: "GET"
  });

  return result.json();
};

let dataListOfBusStops = await getListOfBusStops();
source = dataListOfBusStops.source;

let listOfStops = dataListOfBusStops.data
  .map(({ Name, Identifiers, Codes, Label }) => {
    return {
      Name,
      Label,
      Identifiers: Identifiers.reduce(
        (accumulator, currentValue, currentIndex) => {
          accumulator.push({
            id: currentValue,
            code: Codes[currentIndex]
          });
          return accumulator;
        },
        []
      )
    };
  })
  .sort((a, b) => {
    let labelA = a.Label.toUpperCase();
    let labelB = b.Label.toUpperCase();
    if (labelA < labelB) {
      return -1;
    }
    if (labelA > labelB) {
      return 1;
    }

    return 0;
  });

//Test
await getPredictions(1062);
await getPredictions(1062);

//True-one
let dataItinerariesList = await getPredictions(1062);
let ItinerariesList = dataItinerariesList.data.map(
  (
    { Route, RouteCode, Target, Dir, Dest, Img, Routing, Time, Pred },
    index
  ) => {
    return {
      index,
      routeUID: Route,
      RouteCode,
      targetUID: Target,
      direction: Dir,
      destination: Dest,
      image: Img,
      routingUID: Routing,
      departures: [{ time: Time, predictable: Pred }]
    };
  }
);

//Test
await getItinerary(0);
await getItinerary(0);

let dataListOfDeparture = await getItinerary(0);
let ListOfDeparture = dataListOfDeparture.data.map(
  ({ Code, Time, Pred, Status }) => {
    return { code: Code, time: Time, predictable: Pred, status: Status };
  }
);
