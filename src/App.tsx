import { useMemo } from "react";
import { generateRooms } from "./lib/rooms.ts";
import { useRoute } from "./lib/route.ts";
import { useUpdate } from "./lib/serviceWorker.ts";
import { useInspection } from "./lib/useInspection.ts";
import { ReportScreen } from "./screens/ReportScreen.tsx";
import { RoomScreen } from "./screens/RoomScreen.tsx";
import { RoomsScreen } from "./screens/RoomsScreen.tsx";
import { StartScreen } from "./screens/StartScreen.tsx";

export function App() {
  const [inspection, dispatch, saveFailed] = useInspection();
  const route = useRoute();
  const update = useUpdate();
  const rooms = useMemo(
    () => (inspection.layout ? generateRooms(inspection.layout) : []),
    [inspection.layout],
  );

  let screen;
  if (!inspection.layout || route.name === "start") {
    screen = <StartScreen inspection={inspection} dispatch={dispatch} />;
  } else if (route.name === "report") {
    screen = <ReportScreen inspection={inspection} rooms={rooms} />;
  } else {
    const index =
      route.name === "room"
        ? rooms.findIndex((r) => r.id === route.roomId)
        : -1;
    screen =
      index >= 0 ? (
        <RoomScreen
          key={rooms[index].id}
          room={rooms[index]}
          next={rooms[index + 1]}
          inspection={inspection}
          dispatch={dispatch}
        />
      ) : (
        <RoomsScreen inspection={inspection} rooms={rooms} />
      );
  }

  return (
    <>
      {saveFailed && (
        <div className="banner" role="alert">
          Your answers cannot be saved on this phone. Do not close this page, or
          turn off private browsing and try again.
        </div>
      )}
      {update && (
        <div className="banner banner--info">
          A new version of the app is ready.{" "}
          <button type="button" className="link" onClick={update}>
            Update now
          </button>
        </div>
      )}
      {screen}
    </>
  );
}
