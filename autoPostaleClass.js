window.source = "";
window.url = new URL("http://autopostale.teqmonitoring.com/RTPI-AT/rtpi");

class Util {
    async customFetch(type, data) {
        let getData = async _ =>
            (await fetch(this.buildUrl(type, data), {
                method: "GET"
            })).json();

        let result = await getData();

        if (result.validity === "KO") {
            result = await getData();
            if (result.validity === "KO") {
                result = await getData();
                if (result.validity === "KO") {
                    result = await getData();
                }
            }
        }
        return result;
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
        window.url.search = new URLSearchParams({
            data: JSON.stringify(this.queryParams(type, data))
        });
        return window.url;
    }
}

class AutoPostale extends Util {
    constructor() {
        super();
    }

    async listOfBusStops() {
        let result = await this.customFetch("GETTARGETS", {});
        window.source = result.source;

        return result.data.map(i => new BusStop(i));
    }
}

class BusStop extends Util {
    constructor({
        Name,
        Label,
        Identifiers
    }) {
        super();
        this.shortName = Name;
        this.idBusStop = Identifiers.map(i => parseInt(i));
        this.name = Label;
    }

    async listOfBusArriving() {
        let result = await this.customFetch("GETPREDICTIONS", {
            parameters: this.idBusStop
        });
        return result.data.map(i => new BusArriving(i));
    }
}

class BusArriving extends Util {
    constructor({
        Target,
        Route,
        Dir,
        Routing,
        FromTarget,
        ToTarget
    }) {
        super();
        this.infoBus = {
            idBusStopSelected: parseInt(Target),
            idItinerary: parseInt(Route),
            Direction: Dir,
            Routing
        };
        this.infoDestination = {
            idBusStopFrom: parseInt(FromTarget),
            idBusStopTo: parseInt(ToTarget)
        }
    }

    async itinerary() {
        let result = await this.customFetch("GETROUTING", {
            parameters: Object.values(this.infoBus)
        });
        return {
            data: result.data.map(i => new BusStopArriving(i)),
            delay: parseInt(result.delay),
            lastConnection: result.lastcom
        };
    }
}

class BusStopArriving {
    constructor({
        Status,
        UID,
        Time
    }) {
        this.status = parseInt(Status);
        this.idBusStop = parseInt(UID);
        this.arrivingTime = Time;
    }
}