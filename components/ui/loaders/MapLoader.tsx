import { Skeleton } from "../skeleton";

export function MapLoader() {
  return (
    <Skeleton
      style={{
        height: "70vh",
        width: "100%",
        borderRadius: "16px",
      }}
      className="bg-zinc-500"
    ></Skeleton>
  );
}
