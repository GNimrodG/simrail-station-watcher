import "./styles.css";
import { useLocalStorage, usePrevious } from "@mantine/hooks";
import MapIcon from "@mui/icons-material/Map";
import Alert from "@mui/material/Alert";
import Autocomplete from "@mui/material/Autocomplete";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Divider from "@mui/material/Divider";
import FormControlLabel from "@mui/material/FormControlLabel";
import Grid from "@mui/material/Grid";
import IconButton from "@mui/material/IconButton";
import Link from "@mui/material/Link";
import Slider from "@mui/material/Slider";
import TextField from "@mui/material/TextField";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import { useQuery } from "@tanstack/react-query";
import { SnackbarProvider, enqueueSnackbar } from "notistack";
import { useEffect, useMemo, useRef } from "react";

import Loader from "./components/Loader.tsx";
import StationCard from "./components/StationCard.tsx";
import UpdateIndicator from "./components/UpdateIndicator.tsx";
import { getStationEDRLink } from "./edr-mapping.ts";
import { Server, ServersResponse, Station, StationResponse } from "./types.ts";

async function getStationData(serverCode: string): Promise<StationResponse> {
  const response = await fetch(
    `https://panel.simrail.eu:8084/stations-open?serverCode=${serverCode}`
  );
  return (await response.json()) as StationResponse;
}

async function getStationList(): Promise<ServersResponse> {
  const response = await fetch("https://panel.simrail.eu:8084/servers-open");
  return (await response.json()) as ServersResponse;
}

const currentYear = new Date().getFullYear();
const supportsNotification = "Notification" in window;

/**
 * Shows a system notification about a free station. Uses the Notification constructor where it's allowed, otherwise
 * (e.g. Chrome on Android) the service worker. Never throws.
 * @param onClosed called when the notification is closed (clicking it also opens the station's EDR)
 */
function showStationFreeNotification(station: Station, serverName: string, edrLink: string, onClosed: () => void) {
  if (!supportsNotification || Notification.permission !== "granted") return;

  const title = `Station ${station.Name} is free`;
  const options: NotificationOptions = {
    body: `Station ${station.Name} is free on the ${serverName} server`,
    icon: station.MainImageURL,
    requireInteraction: true,
    tag: `station-free-${station.Name}`,
    data: { station: station.Name, url: edrLink },
  };

  try {
    const notification = new Notification(title, options);

    // only available in secure context
    notification.addEventListener("close", () => {
      onClosed();
      window.open(edrLink, "_blank");
    });
    return;
  } catch (e) {
    // "Illegal constructor": the page may only show notifications through a service worker
    if (!(e instanceof TypeError) || !("serviceWorker" in navigator)) {
      console.error("Failed to show the station notification", e);
      return;
    }
  }

  // the close and click events arrive as messages from the service worker
  navigator.serviceWorker.ready
    .then((registration) => registration.showNotification(title, options))
    .catch((e) => console.error("Failed to show the station notification", e));
}

function App() {
  const [selectedServer, setSelectedServer] = useLocalStorage<Server | null>({
    key: "selectedServer",
    defaultValue: null,
  });

  const [_watchedStations, setWatchedStations] = useLocalStorage<string[]>({
    key: "watchedStations",
    defaultValue: [],
  });

  const watchedStations = useMemo(() => _watchedStations ?? [], [_watchedStations]);

  const [updateInterval, setUpdateInterval] = useLocalStorage({
    key: "updateInterval",
    defaultValue: 15000,
  });
  const [_favoriteStations, setFavoriteStations] = useLocalStorage<string[]>({
    key: "favoriteStations",
    defaultValue: [],
  });

  const favoriteStations = _favoriteStations ?? [];

  // the watched stations that were already notified about being free
  const notifiedStations = useRef(new Set<string>());

  const { data: servers } = useQuery({
    queryKey: ["servers"],
    queryFn: getStationList,
    refetchInterval: 5 * 60 * 1000, // 5 minutes
  });

  const { data, dataUpdatedAt, errorUpdatedAt } = useQuery({
    queryKey: ["stations", selectedServer],
    queryFn: () => getStationData(selectedServer?.ServerCode ?? "en1"),
    refetchInterval: updateInterval,
    enabled: !!servers && !!selectedServer,
  });

  const stationChangeDetector = useMemo(() => {
    return data?.data?.map((x) => ({ station: x, free: !x.DispatchedBy.length }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data?.data?.map((x) => x.DispatchedBy.length).join(",")]);

  const stationChangeDetectorPrev = usePrevious(stationChangeDetector);

  const lastDataChanged = useMemo(() => {
    return new Date().toLocaleTimeString();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stationChangeDetector]);

  useEffect(() => {
    if (stationChangeDetector && stationChangeDetectorPrev) {
      // Send a notistack notification for each station that changed
      for (let i = 0; i < stationChangeDetector.length; i++) {
        if (stationChangeDetector[i].free !== stationChangeDetectorPrev[i].free) {
          enqueueSnackbar(
            `${stationChangeDetector[i].station.Name} is now ${
              stationChangeDetector[i].free ? "FREE" : "OCCUPIED"
            } at ${new Date().toLocaleTimeString()}`,
            { variant: "info" }
          );
        }
      }
    }
  }, [stationChangeDetector, stationChangeDetectorPrev]);

  useEffect(() => {
    document.getElementById("loading-style")?.remove();

    if (!supportsNotification) {
      alert("This browser does not support desktop notifications!");
      return;
    }

    if (Notification?.permission === "denied") {
      alert(
        "You have denied desktop notifications. As a result, you will not receive station-free notifications."
      );
      return;
    }

    Notification?.requestPermission?.().then((permission) => {
      if (permission !== "granted") {
        alert(
          "You have denied desktop notifications. As a result, you will not receive station-free notifications."
        );
      }
    }) || alert("This browser does not support desktop notifications!");
  }, []);

  // A notification shown by the service worker was clicked or dismissed
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    const onMessage = (event: MessageEvent) => {
      if (event.data?.type !== "station-notification-closed" || typeof event.data.station !== "string") return;

      notifiedStations.current.delete(event.data.station);
      setWatchedStations((stations) => stations.filter((x) => x !== event.data.station));
    };

    navigator.serviceWorker.addEventListener("message", onMessage);
    navigator.serviceWorker.startMessages();

    return () => navigator.serviceWorker.removeEventListener("message", onMessage);
  }, [setWatchedStations]);

  useEffect(() => {
    // forget the stations that are no longer watched, so watching them again notifies again
    notifiedStations.current.forEach((name) => {
      if (!watchedStations.includes(name)) notifiedStations.current.delete(name);
    });

    if (data?.result) {
      data.data.forEach((station) => {
        // send notification if station is free
        if (
          station.DispatchedBy.length === 0 &&
          watchedStations.includes(station.Name) &&
          !notifiedStations.current.has(station.Name)
        ) {
          // marked first, a failing notification must not be retried (and the snackbar repeated) on every update
          notifiedStations.current.add(station.Name);

          enqueueSnackbar(`Station ${station.Name} is free`, { variant: "info" });

          showStationFreeNotification(
            station,
            selectedServer?.ServerName ?? "en1",
            getStationEDRLink(station, selectedServer?.ServerCode ?? "en1"),
            () => {
              notifiedStations.current.delete(station.Name);
              setWatchedStations((stations) => stations.filter((x) => x !== station.Name));
            }
          );
        }
      });
    }
  }, [data, watchedStations, selectedServer, setWatchedStations]);

  function toggleFavorite(station: string) {
    setFavoriteStations((stations) =>
      stations.includes(station) ? stations.filter((x) => x !== station) : [...stations, station]
    );
  }

  function toggleWatched(station: string) {
    setWatchedStations((stations) =>
      stations.includes(station) ? stations.filter((x) => x !== station) : [...stations, station]
    );
  }

  return (
    <>
      <SnackbarProvider
        classes={{
          containerAnchorOriginBottomLeft: "snackbar-bottom-left",
        }}
        style={{ bottom: 72, left: 16, right: 16 }}
      />
      <UpdateIndicator
        updateInterval={updateInterval || 15000}
        dataUpdatedAt={dataUpdatedAt}
        errorUpdatedAt={errorUpdatedAt}
      />
      <Container sx={{ paddingY: (theme) => theme.spacing(2), minHeight: "calc(100vh - 81px)" }}>
        <Grid
          container
          spacing={1}
          sx={{ justifyContent: "space-around", alignItems: "center" }}>
          <Grid
            size={{ sm: 2, xs: 12 }}>
            <FormControlLabel
              sx={{ width: "calc(100% - 32px)" }}
              control={
                <Slider
                  value={updateInterval}
                  onChange={(_e, v) => setUpdateInterval(v as number)}
                  valueLabelDisplay="auto"
                  step={1000}
                  valueLabelFormat={(v) => `${v / 1000} s`}
                  min={5000}
                  max={60000}
                />
              }
              label="Refresh interval"
              labelPlacement="top"
            />
          </Grid>
          <Grid
            size={{ sm: 9, xs: 11 }}>
            <Autocomplete
              disableClearable
              options={servers?.data ?? []}
              value={selectedServer as Server}
              getOptionLabel={(option) => option.ServerName}
              isOptionEqualToValue={(option, value) => option.ServerCode === value.ServerCode}
              onChange={(_e, v) => setSelectedServer(v)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Server"
                />
              )}
            />
          </Grid>
          {!!selectedServer && (
            <Grid
              size={{ xs: 1, sm: "auto" }}>
              <Tooltip title="Open the Live map for the server">
                <IconButton
                  href={`https://map.simrail.app/server/${selectedServer.ServerCode}`}
                  target="_blank">
                  <MapIcon />
                </IconButton>
              </Tooltip>
            </Grid>
          )}
          {!!selectedServer && !data && (
            <Grid
              sx={{
                paddingTop: "calc(50vh - 135px) !important",
                paddingLeft: "0 !important",
              }}>
              <Loader />
            </Grid>
          )}
          {!selectedServer && (
            <Grid
              size={12}>
              <Typography align="center">Please select a server</Typography>
            </Grid>
          )}
          {data && !data.result && (
            <Grid>
              <span>Something went wrong</span>
              <Alert severity="error">{data.description}</Alert>
            </Grid>
          )}
          {!!selectedServer && data && data.result && (
            <>
              <Grid
                size={12}>
                <Autocomplete
                  multiple
                  disabled={supportsNotification && Notification?.permission !== "granted"}
                  options={data.data.map((x) => x.Name)}
                  value={watchedStations}
                  onChange={(_e, v) => setWatchedStations(v)}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Watched stations"
                      helperText={
                        supportsNotification
                          ? Notification?.permission !== "granted"
                            ? "You cannot watch stations because you disabled the notifications permission for this website."
                            : "You will receive desktop notifications when any of these stations become available."
                          : "You cannot watch stations because this browser doesn't support notifications."
                      }
                    />
                  )}
                />
              </Grid>

              {!!favoriteStations.length && (
                <>
                  {data.data
                    .filter((x) => favoriteStations.includes(x.Name))
                    .sort((a, b) => a.Prefix.localeCompare(b.Prefix))
                    .map((station) => (
                      <Grid
                        key={station.id}>
                        <StationCard
                          station={station}
                          serverCode={selectedServer.ServerCode}
                          isFavorite={favoriteStations.includes(station.Name)}
                          onFavoriteToggle={toggleFavorite}
                          isWatched={watchedStations.includes(station.Name)}
                          onWatchedToggle={toggleWatched}
                        />
                      </Grid>
                    ))}
                  <Grid
                    size={12}>
                    <Divider sx={{ borderBottomWidth: 2, opacity: 0.6 }} />
                  </Grid>
                </>
              )}
              {data.data
                .filter((x) => !favoriteStations.includes(x.Name))
                .sort((a, b) => a.Prefix.localeCompare(b.Prefix))
                .map((station) => (
                  <Grid
                    key={station.id}>
                    <StationCard
                      station={station}
                      serverCode={selectedServer.ServerCode}
                      isFavorite={favoriteStations.includes(station.Name)}
                      onFavoriteToggle={toggleFavorite}
                      isWatched={watchedStations.includes(station.Name)}
                      onWatchedToggle={toggleWatched}
                    />
                  </Grid>
                ))}
            </>
          )}
        </Grid>
      </Container>
      <Box
        sx={{
          position: "sticky",
          bottom: 0,
          left: 0,
          right: 0,
          paddingY: 1,
          paddingX: 2,
          marginTop: 2,
          display: "grid",
          gridTemplateColumns: "1fr auto 1fr",
          color: (theme) => theme.palette.text.secondary,
          borderTop: (theme) => `1px solid ${theme.palette.divider}`,
          backgroundColor: (theme) => theme.palette.background.paper,
        }}>
        <Box sx={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
          {!!lastDataChanged && (
            <Typography
              variant="caption"
              sx={{ display: "block" }}>
              Last change: {lastDataChanged}
            </Typography>
          )}
        </Box>
        <Box sx={{ textAlign: "center" }}>
          <Typography
            variant="caption"
            sx={{ display: "block" }}
            gutterBottom>
            This website is not affiliated with the{" "}
            <Link
              href="https://simrail.eu"
              target="_blank">
              SimRail
            </Link>{" "}
            team.
          </Typography>
          <Typography
            variant="caption"
            sx={{ display: "block" }}
            gutterBottom>
            Copyright &copy; {currentYear}{" "}
            <Link
              href="https://github.com/GNimrodG"
              target="_blank">
              GNimrodG
            </Link>
          </Typography>
        </Box>
      </Box>
    </>
  );
}

export default App;
